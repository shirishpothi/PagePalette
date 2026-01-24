import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to save order to SheetDB
async function saveToSheetDB(orderData) {
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
      <td style="padding: 5px 0; text-align: right; color: #555;"></td>
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
  <title>Your PagePalette Order!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background: #0f1115; padding: 40px 20px; text-align: center; }
    .logo-text { font-family: 'Georgia', serif; font-size: 28px; color: #fff; font-weight: bold; letter-spacing: 1px; }
    .logo-sub { color: #888; font-size: 14px; margin-top: 5px; }
    .content { padding: 40px; }
    .greeting { font-size: 22px; font-weight: bold; color: #111; margin-bottom: 20px; }
    .message { color: #555; margin-bottom: 30px; font-size: 16px; }
    .receipt-box { background: #f9f9f9; border: 2px dashed #eee; border-radius: 12px; padding: 25px; margin-bottom: 30px; }
    .success-badge { background: #dcfce7; border: 1px solid #86efac; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
    .success-title { font-weight: bold; color: #166534; font-size: 18px; }
    .footer { background: #f4f4f5; padding: 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
       <div class="logo-text">PagePalette</div>
       <div class="logo-sub">Order #${orderId}</div>
    </div>
    
    <div class="content">
       <div class="greeting">Hi ${customerName}! 👋</div>
       
       <div class="success-badge">
          <div class="success-title">✅ Payment Received!</div>
          <p style="margin: 10px 0 0 0; color: #166534;">Your payment has been confirmed via Stripe.</p>
       </div>

       <p class="message">
         Thank you for your order! Your customizable notebook is now being prepared.
         We'll notify you when it's ready for pickup at school.
       </p>

       <div class="receipt-box">
          <div style="font-weight: bold; margin-bottom: 15px; text-transform: uppercase; font-size: 12px; color: #888; letter-spacing: 1px;">Your Order Summary</div>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
            <tr style="border-top: 1px solid #ddd;">
              <td style="padding-top: 15px; font-weight: bold; font-size: 18px; color: #111;">Total Paid</td>
              <td style="padding-top: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #166534;">$${totalAmount} SGD</td>
            </tr>
          </table>
       </div>
    </div>
    
     <div class="footer">
       <p>Sent with ❤️ by the PagePalette Team</p>
       <p>A Junior Achievement Singapore Company: PagePalette • © 2025</p>
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
      subject: `💳 PAID - New Order ${orderId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #166534;">💳 Payment Received via Stripe!</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
          <p><strong>Bundle:</strong> ${orderData?.Bundle || 'N/A'}</p>
          <p><strong>Items:</strong> ${orderData?.Items || 'N/A'}</p>
          <p><strong>Total:</strong> $${orderData?.["Total Amount"] || 'N/A'} SGD</p>
          <p><strong>Payment Method:</strong> Stripe (Card/PayNow)</p>
          <p><strong>Status:</strong> <span style="color: #166534; font-weight: bold;">PAID</span></p>
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

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // If we have a webhook secret, verify the signature
    if (webhookSecret && sig) {
      // For Vercel, we need to get the raw body
      const rawBody = JSON.stringify(req.body);
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // Fallback for development or if no webhook secret
      event = req.body;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Only process if payment was successful
    if (session.payment_status === 'paid') {
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
        "Stripe Session": session.id,
        "Payment Intent": session.payment_intent || 'N/A'
      };

      // Save to SheetDB
      await saveToSheetDB(orderData);

      // Send confirmation email to customer
      await sendConfirmationEmail(customerEmail, customerName, orderId, orderData);

      // Send notification to admin
      await sendAdminNotification(orderId, customerName, customerEmail, orderData);

      console.log(`Order ${orderId} processed successfully via webhook`);
    }
  }

  // Return success
  res.status(200).json({ received: true });
}
