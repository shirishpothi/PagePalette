/**
 * Build version: 2024-12-15-v3
 * This file is the main Hono server entry point for the React Router app.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { hash, verify } from 'argon2';
import { Hono } from 'hono';
import { contextStorage, getContext } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { bodyLimit } from 'hono/body-limit';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/node';
import { serializeError } from 'serialize-error';
import ws from 'ws';
import { Resend } from 'resend';
import NeonAdapter from './adapter';
import { getHTMLForErrorPage } from './get-html-for-error-page';
import { isAuthAction } from './is-auth-action';
import { API_BASENAME, api } from './route-builder';
neonConfig.webSocketConstructor = ws;

// Initialize Resend for emails
const resend = new Resend(process.env.RESEND_API_KEY);

const als = new AsyncLocalStorage<{ requestId: string }>();

for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  const original = nodeConsole[method].bind(console);

  console[method] = (...args: unknown[]) => {
    const requestId = als.getStore()?.requestId;
    if (requestId) {
      original(`[traceId:${requestId}]`, ...args);
    } else {
      original(...args);
    }
  };
}

// Only initialize database if DATABASE_URL is configured
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
}) : null;
const adapter = pool ? NeonAdapter(pool) : null;

const app = new Hono();

app.use('*', requestId());

app.use('*', (c, next) => {
  const requestId = c.get('requestId');
  return als.run({ requestId }, () => next());
});

// Add performance caching headers for static assets
app.use('/assets/*', async (c, next) => {
  await next();
  // Cache static assets for 1 year (immutable content-hashed files)
  c.res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
});

// Cache fonts and images longer
app.use('/fonts/*', async (c, next) => {
  await next();
  c.res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
});

// Add preload headers for critical resources on HTML pages
app.use('*', async (c, next) => {
  await next();
  const contentType = c.res.headers.get('content-type');
  if (contentType?.includes('text/html')) {
    // Add Link headers for preloading critical resources
    const linkHeaders = [
      '<https://fonts.googleapis.com>; rel=preconnect',
      '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
    ];
    c.res.headers.set('Link', linkHeaders.join(', '));
  }
});

app.use(contextStorage());

app.onError((err, c) => {
  if (c.req.method !== 'GET') {
    return c.json(
      {
        error: 'An error occurred in your app',
        details: serializeError(err),
      },
      500
    );
  }
  return c.html(getHTMLForErrorPage(err), 200);
});

if (process.env.CORS_ORIGINS) {
  app.use(
    '/*',
    cors({
      origin: process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    })
  );
}
for (const method of ['post', 'put', 'patch'] as const) {
  app[method](
    '*',
    bodyLimit({
      maxSize: 4.5 * 1024 * 1024, // 4.5mb to match vercel limit
      onError: (c) => {
        return c.json({ error: 'Body size limit exceeded' }, 413);
      },
    })
  );
}

// Only initialize auth if both AUTH_SECRET and DATABASE_URL are configured
if (process.env.AUTH_SECRET && process.env.DATABASE_URL && adapter) {
  app.use(
    '*',
    initAuthConfig((c) => ({
      secret: c.env.AUTH_SECRET,
      pages: {
        signIn: '/account/signin',
        signOut: '/account/logout',
      },
      skipCSRFCheck,
      session: {
        strategy: 'jwt',
      },
      callbacks: {
        session({ session, token }) {
          if (token.sub) {
            session.user.id = token.sub;
          }
          return session;
        },
      },
      cookies: {
        csrfToken: {
          options: {
            secure: true,
            sameSite: 'none',
          },
        },
        sessionToken: {
          options: {
            secure: true,
            sameSite: 'none',
          },
        },
        callbackUrl: {
          options: {
            secure: true,
            sameSite: 'none',
          },
        },
      },
      providers: [
        Credentials({
          id: 'credentials-signin',
          name: 'Credentials Sign in',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
          },
          authorize: async (credentials) => {
            const { email, password } = credentials;
            if (!email || !password) {
              return null;
            }
            if (typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }

            // logic to verify if user exists
            const user = await adapter.getUserByEmail(email);
            if (!user) {
              return null;
            }
            const matchingAccount = user.accounts.find(
              (account) => account.provider === 'credentials'
            );
            const accountPassword = matchingAccount?.password;
            if (!accountPassword) {
              return null;
            }

            const isValid = await verify(accountPassword, password);
            if (!isValid) {
              return null;
            }

            // return user object with the their profile data
            return user;
          },
        }),
        Credentials({
          id: 'credentials-signup',
          name: 'Credentials Sign up',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
            name: { label: 'Name', type: 'text' },
            image: { label: 'Image', type: 'text', required: false },
          },
          authorize: async (credentials) => {
            const { email, password, name, image } = credentials;
            if (!email || !password) {
              return null;
            }
            if (typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }

            // logic to verify if user exists
            const user = await adapter.getUserByEmail(email);
            if (!user) {
              const newUser = await adapter.createUser({
                id: crypto.randomUUID(),
                emailVerified: null,
                email,
                name: typeof name === 'string' && name.length > 0 ? name : undefined,
                image: typeof image === 'string' && image.length > 0 ? image : undefined,
              });
              await adapter.linkAccount({
                extraData: {
                  password: await hash(password),
                },
                type: 'credentials',
                userId: newUser.id,
                providerAccountId: newUser.id,
                provider: 'credentials',
              });
              return newUser;
            }
            return null;
          },
        }),
      ],
    }))
  );
}
app.all('/integrations/:path{.+}', async (c, next) => {
  const queryParams = c.req.query();
  const url = `${process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? 'https://www.create.xyz'}/integrations/${c.req.param('path')}${Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : ''}`;

  return proxy(url, {
    method: c.req.method,
    body: c.req.raw.body ?? null,
    // @ts-ignore - this key is accepted even if types not aware and is
    // required for streaming integrations
    duplex: 'half',
    redirect: 'manual',
    headers: {
      ...c.req.header(),
      'X-Forwarded-For': process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-host': process.env.NEXT_PUBLIC_CREATE_HOST,
      Host: process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-project-group-id': process.env.NEXT_PUBLIC_PROJECT_GROUP_ID,
    },
  });
});

// Only handle auth routes if AUTH_SECRET is configured
if (process.env.AUTH_SECRET) {
  app.use('/api/auth/*', async (c, next) => {
    if (isAuthAction(c.req.path)) {
      return authHandler()(c, next);
    }
    return next();
  });
}

app.route(API_BASENAME, api);

// Inline order API handler (guaranteed to be bundled)
app.get('/api/order', async (c) => {
  return c.json({ status: 'Order API is working', timestamp: new Date().toISOString() });
});

app.post('/api/order', async (c) => {
  try {
    const body = await c.req.json();
    const { orderData, customerEmail, customerName, orderId } = body;

    // 1. Save to SheetDB
    const sheetPayload = { data: [orderData] };
    
    const sheetResponse = await fetch("https://sheetdb.io/api/v1/i3ywkjbojouc9", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SHEETDB_API_TOKEN}`
      },
      body: JSON.stringify(sheetPayload)
    });

    if (!sheetResponse.ok) {
      console.error("SheetDB Error:", await sheetResponse.text());
    }

    // 2. Send confirmation email to customer
    if (customerEmail && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'PagePalette <orders@resend.dev>',
          to: customerEmail,
          subject: `Order Confirmed - ${orderId}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f1115; color: white; padding: 40px; border-radius: 16px;">
              <h1 style="color: #4ADE80; margin-bottom: 24px;">Order Confirmed! 🎉</h1>
              <p>Hi ${customerName},</p>
              <p>Thank you for your order! Here are your details:</p>
              
              <div style="background: #1a1a1a; padding: 20px; border-radius: 12px; margin: 24px 0;">
                <p style="margin: 8px 0;"><strong>Order ID:</strong> ${orderId}</p>
                <p style="margin: 8px 0;"><strong>Bundle:</strong> ${orderData?.Bundle || 'N/A'}</p>
                <p style="margin: 8px 0;"><strong>Items:</strong> ${orderData?.Items || 'N/A'}</p>
                <p style="margin: 8px 0;"><strong>Total:</strong> $${orderData?.["Total Amount"] || 'N/A'}</p>
                <p style="margin: 8px 0;"><strong>Payment Method:</strong> ${orderData?.["Payment Method"] || 'N/A'}</p>
              </div>
              
              <p style="color: #888;">Please complete your payment and send a screenshot to <strong style="color: #4ADE80;">shirish.pothi.27@nexus.edu.sg</strong></p>
              
              <p style="margin-top: 32px; color: #666; font-size: 14px;">- The PagePalette Team</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Email to customer failed:", emailError);
      }

      // 3. Send notification to admin
      if (process.env.ADMIN_EMAIL) {
        try {
          await resend.emails.send({
            from: process.env.FROM_EMAIL || 'PagePalette <orders@resend.dev>',
            to: process.env.ADMIN_EMAIL,
            subject: `New Order - ${orderId}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>New Order Received!</h2>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
                <p><strong>Bundle:</strong> ${orderData?.Bundle || 'N/A'}</p>
                <p><strong>Items:</strong> ${orderData?.Items || 'N/A'}</p>
                <p><strong>Total:</strong> $${orderData?.["Total Amount"] || 'N/A'}</p>
                <p><strong>Payment Method:</strong> ${orderData?.["Payment Method"] || 'N/A'}</p>
                <p><strong>Role:</strong> ${orderData?.Role || 'N/A'}</p>
                ${orderData?.["Student Name"] && orderData["Student Name"] !== "N/A" ? `<p><strong>Student:</strong> ${orderData["Student Name"]} (${orderData["Student Email"]})</p>` : ''}
                ${orderData?.Year && orderData.Year !== "N/A" ? `<p><strong>Year/Class:</strong> ${orderData.Year}/${orderData.Class}</p>` : ''}
              </div>
            `
          });
        } catch (adminEmailError) {
          console.error("Admin notification failed:", adminEmailError);
        }
      }
    }

    return c.json({ success: true, orderId });

  } catch (error: any) {
    console.error("Order API Error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Catch-all for unhandled API routes to return JSON 404 instead of HTML
app.all('/api/*', (c) => {
  return c.json(
    { error: 'Not Found', message: `API endpoint ${c.req.path} does not exist` },
    404
  );
});

export default await createHonoServer({
  app,
  defaultLogger: false,
});
