import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to save order to SheetDB (with duplicate check)
async function saveToSheetDB(orderData) {
  // First check if order already exists
  try {
    const checkResponse = await fetch(`https://sheetdb.io/api/v1/i3ywkjbojouc9/search?Order%20ID=${encodeURIComponent(orderData["Order ID"])}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${process.env.SHEETDB_API_TOKEN}`
      }
    });
    
    if (checkResponse.ok) {
      const existing = await checkResponse.json();
      if (existing && existing.length > 0) {
        console.log(`Order ${orderData["Order ID"]} already exists in sheet`);
        return true; // Already saved
      }
    }
  } catch (e) {
    console.log("Could not check for existing order, proceeding with save");
  }

  const sheetPayload = { data: [orderData] };
  
  const response = await fetch("https://sheetdb.io/api/v1/i3ywkjbojouc9", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.SHEETDB_API_TOKEN}`
    },
    body: JSON.stringify(sheetPayload)
  });

  if (!response.ok) {
    console.error("SheetDB Error:", await response.text());
    return false;
  }
  return true;
}

// Helper to send confirmation email
async function sendConfirmationEmail(customerEmail, customerName, orderId, orderData) {
  if (!customerEmail || !process.env.RESEND_API_KEY) return;

  const itemsList = orderData?.Items ? orderData.Items.split(',').map(item => item.trim()) : [];
  const itemsHtml = itemsList.map(item => `
    <tr>
      <td style="padding: 5px 0; color: #555;">${item}</td>
    </tr>
  `).join('');
  const totalAmount = orderData?.["Total Amount"] || '0.00';

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL ? `PagePalette <${process.env.FROM_EMAIL.split('<')[1] || process.env.FROM_EMAIL}>` : 'PagePalette <orders@resend.dev>',
      to: customerEmail,
      bcc: 'shirish.pothi.27@nexus.edu.sg',
      subject: `Payment Confirmed! 🎉 (Order #${orderId})`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; }
    .header { background: #0f1115; padding: 40px 20px; text-align: center; }
    .logo-text { font-family: 'Georgia', serif; font-size: 28px; color: #fff; font-weight: bold; }
    .logo-sub { color: #888; font-size: 14px; margin-top: 5px; }
    .content { padding: 40px; }
    .success-badge { background: #dcfce7; border: 1px solid #86efac; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
    .success-title { font-weight: bold; color: #166534; font-size: 18px; }
    .receipt-box { background: #f9f9f9; border: 2px dashed #eee; border-radius: 12px; padding: 25px; }
    .footer { background: #f4f4f5; padding: 30px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
       <div class="logo-text">PagePalette</div>
       <div class="logo-sub">Order #${orderId}</div>
    </div>
    <div class="content">
       <div style="font-size: 22px; font-weight: bold; color: #111; margin-bottom: 20px;">Hi ${customerName}! 👋</div>
       <div class="success-badge">
          <div class="success-title">✅ Payment Received!</div>
          <p style="margin: 10px 0 0 0; color: #166534;">Your payment has been confirmed.</p>
       </div>
       <p style="color: #555; margin-bottom: 30px;">Thank you for your order! Your customizable notebook is now being prepared. We'll notify you when it's ready for pickup at school.</p>
       <div class="receipt-box">
          <div style="font-weight: bold; margin-bottom: 15px; text-transform: uppercase; font-size: 12px; color: #888;">Order Summary</div>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
            <tr style="border-top: 1px solid #ddd;">
              <td style="padding-top: 15px; font-weight: bold; font-size: 18px; color: #166534;">Total Paid: $${totalAmount} SGD</td>
            </tr>
          </table>
       </div>
    </div>
    <div class="footer">
       <p>Sent with ❤️ by the PagePalette Team</p>
       <p>A Junior Achievement Singapore Company • © 2025</p>
    </div>
  </div>
</body>
</html>
      `
    });
  } catch (emailError) {
    console.error("Customer email failed:", emailError);
  }
}

// Helper to send admin notification
async function sendAdminNotification(orderId, customerName, customerEmail, orderData) {
  if (!process.env.ADMIN_EMAIL || !process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'PagePalette <orders@resend.dev>',
      to: process.env.ADMIN_EMAIL,
      subject: `💳 PAID - Order ${orderId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #166534;">💳 Payment Received!</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
          <p><strong>Bundle:</strong> ${orderData?.Bundle || 'N/A'}</p>
          <p><strong>Items:</strong> ${orderData?.Items || 'N/A'}</p>
          <p><strong>Total:</strong> $${orderData?.["Total Amount"]} SGD</p>
          <p><strong>Payment:</strong> Stripe Online</p>
          <p><strong>Status:</strong> <span style="color: #166534; font-weight: bold;">PAID</span></p>
        </div>
      `
    });
  } catch (adminEmailError) {
    console.error("Admin notification failed:", adminEmailError);
  }
}

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id, process_order } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // If payment is complete and process_order flag is set, save to sheet and send emails
    if (session.payment_status === 'paid' && process_order === 'true') {
      const metadata = session.metadata || {};
      const orderId = metadata.order_id || session.id.slice(-12);
      const customerName = metadata.customer_name || 'Customer';
      const customerEmail = session.customer_email || metadata.customer_email;
      
      // Calculate total from Stripe (convert from cents)
      const totalAmount = ((session.amount_total || 0) / 100).toFixed(2);
      
      // Build order data for SheetDB
      const orderData = {
        "Order ID": orderId,
        "Date": new Date().toISOString().replace('T', ' ').split('.')[0],
        "Order Type": "Pre-Order",
        "Bundle": metadata.bundle === 'starter' ? "Starter Bundle" : "Complete Bundle",
        "Name": customerName,
        "Email": customerEmail || 'N/A',
        "Role": metadata.role || 'N/A',
        "Student Name": metadata.student_name || 'N/A',
        "Student Email": metadata.student_email || 'N/A',
        "Year": metadata.year || 'N/A',
        "Class": metadata.class || 'N/A',
        "Position": metadata.position || 'N/A',
        "Room": metadata.room || 'N/A',
        "Items": metadata.items || 'N/A',
        "Total Amount": totalAmount,
        "Payment Method": "Stripe (Online)",
        "Status": "Paid",
        "Stripe Session": session.id
      };

      // Save to SheetDB
      const saved = await saveToSheetDB(orderData);

      // Send emails only if we just saved (not a duplicate)
      if (saved) {
        await sendConfirmationEmail(customerEmail, customerName, orderId, orderData);
        await sendAdminNotification(orderId, customerName, customerEmail, orderData);
      }

      console.log(`Order ${orderId} processed via checkout-session API`);
    }

    res.status(200).json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error('Stripe session retrieve error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve session',
      message: error.message 
    });
  }
}
