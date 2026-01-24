import { readdir, stat, access } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

// Get current directory
const __dirname = join(fileURLToPath(new URL('.', import.meta.url)), '../src/app/api');
console.log('[route-builder] API directory:', __dirname);

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Recursively find all route.js files
async function findRouteFiles(dir: string): Promise<string[]> {
  // Check if directory exists first
  try {
    await access(dir);
  } catch {
    // Directory doesn't exist, return empty array
    return [];
  }
  
  const files = await readdir(dir);
  let routes: string[] = [];

  for (const file of files) {
    try {
      const filePath = join(dir, file);
      const statResult = await stat(filePath);

      if (statResult.isDirectory()) {
        routes = routes.concat(await findRouteFiles(filePath));
      } else if (file === 'route.js') {
        // Handle root route.js specially
        if (filePath === join(__dirname, 'route.js')) {
          routes.unshift(filePath); // Add to beginning of array
        } else {
          routes.push(filePath);
        }
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  return routes;
}

// Helper function to transform file path to Hono route path
function getHonoPath(routeFile: string): { name: string; pattern: string }[] {
  const relativePath = routeFile.replace(__dirname, '');
  const parts = relativePath.split('/').filter(Boolean);
  const routeParts = parts.slice(0, -1); // Remove 'route.js'
  if (routeParts.length === 0) {
    return [{ name: 'root', pattern: '' }];
  }
  const transformedParts = routeParts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
  return transformedParts;
}

// Import and register all routes
async function registerRoutes() {
  const routeFiles = (
    await findRouteFiles(__dirname).catch((error) => {
      console.error('[route-builder] Error finding route files:', error);
      return [];
    })
  )
    .slice()
    .sort((a, b) => {
      return b.length - a.length;
    });

  console.log('[route-builder] Found route files:', routeFiles);

  // Clear existing routes
  api.routes = [];

  for (const routeFile of routeFiles) {
    try {
      const route = await import(/* @vite-ignore */ `${routeFile}?update=${Date.now()}`);
      console.log('[route-builder] Loaded route:', routeFile, 'exports:', Object.keys(route));

      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      for (const method of methods) {
        try {
          if (route[method]) {
            const parts = getHonoPath(routeFile);
            const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;
            const handler: Handler = async (c) => {
              const params = c.req.param();
              if (import.meta.env.DEV) {
                const updatedRoute = await import(
                  /* @vite-ignore */ `${routeFile}?update=${Date.now()}`
                );
                return await updatedRoute[method](c.req.raw, { params });
              }
              return await route[method](c.req.raw, { params });
            };
            const methodLowercase = method.toLowerCase();
            switch (methodLowercase) {
              case 'get':
                api.get(honoPath, handler);
                break;
              case 'post':
                api.post(honoPath, handler);
                break;
              case 'put':
                api.put(honoPath, handler);
                break;
              case 'delete':
                api.delete(honoPath, handler);
                break;
              case 'patch':
                api.patch(honoPath, handler);
                break;
              default:
                console.warn(`Unsupported method: ${method}`);
                break;
            }
          }
        } catch (error) {
          console.error(`Error registering route ${routeFile} for method ${method}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error importing route file ${routeFile}:`, error);
    }
  }
}

// Use import.meta.glob to ensure routes are bundled in production
const routeModules = import.meta.glob('../src/app/api/**/route.js', {
  eager: true,
});

console.log('[route-builder] Glob found routes:', Object.keys(routeModules));

// Register routes from glob imports
function registerRoutesFromGlob() {
  api.routes = [];
  
  for (const [path, module] of Object.entries(routeModules)) {
    const route = module as Record<string, unknown>;
    
    // Convert path like '../src/app/api/order/route.js' to '/order'
    const relativePath = path
      .replace('../src/app/api', '')
      .replace('/route.js', '')
      || '/';
    
    const honoPath = relativePath === '/' ? '/' : relativePath;
    
    console.log('[route-builder] Registering route:', honoPath, 'methods:', Object.keys(route).filter(k => ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(k)));
    
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
    for (const method of methods) {
      if (typeof route[method] === 'function') {
        const handler: Handler = async (c) => {
          const params = c.req.param();
          return await (route[method] as Function)(c.req.raw, { params });
        };
        
        switch (method) {
          case 'GET':
            api.get(honoPath, handler);
            break;
          case 'POST':
            api.post(honoPath, handler);
            break;
          case 'PUT':
            api.put(honoPath, handler);
            break;
          case 'DELETE':
            api.delete(honoPath, handler);
            break;
          case 'PATCH':
            api.patch(honoPath, handler);
            break;
        }
      }
    }
  }
}

// Register routes
registerRoutesFromGlob();

// Hot reload routes in development
if (import.meta.env.DEV) {
  if (import.meta.hot) {
    import.meta.hot.accept((newSelf) => {
      registerRoutesFromGlob();
    });
  }
}

export { api, API_BASENAME };
