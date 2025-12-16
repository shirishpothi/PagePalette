import Stripe from 'stripe';

// Initialize Stripe - check for API key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Price IDs for PagePalette products (in SGD)
const PRICE_IDS = {
  starter: 'price_1SetDA0z7bZoqy7rP6MFG4x5',    // $16 SGD
  complete: 'price_1SetCz0z7bZoqy7ruspou1XA',   // $21 SGD
  extra: 'price_1SetD20z7bZoqy7ruCqf2uyE',      // $3 SGD per extra
};

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for API key
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const { 
      bundleId,           // 'starter' or 'complete'
      extraCount,         // number of extra PagePals
      customerEmail,
      customerName,
      orderId,
      orderMetadata       // Additional order info for tracking
    } = req.body;

    // Build line items
    const lineItems = [];

    // Add bundle
    if (bundleId === 'starter') {
      lineItems.push({
        price: PRICE_IDS.starter,
        quantity: 1,
      });
    } else if (bundleId === 'complete') {
      lineItems.push({
        price: PRICE_IDS.complete,
        quantity: 1,
      });
    } else {
      return res.status(400).json({ error: 'Invalid bundle ID' });
    }

    // Add extras if any
    if (extraCount && extraCount > 0) {
      lineItems.push({
        price: PRICE_IDS.extra,
        quantity: extraCount,
      });
    }

    // Determine the return URL based on environment
    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://pagepalette.tech';
    const returnUrl = `${origin}/order?session_id={CHECKOUT_SESSION_ID}&status=complete`;

    // Create checkout session with embedded mode
    // Only use 'card' to avoid issues with unsupported payment methods
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: lineItems,
      mode: 'payment',
      return_url: returnUrl,
      customer_email: customerEmail || undefined,
      metadata: {
        order_id: orderId || '',
        customer_name: customerName || '',
        bundle: bundleId,
        extra_count: String(extraCount || 0),
        ...(orderMetadata || {}),
      },
    });

    res.status(200).json({ 
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
}
