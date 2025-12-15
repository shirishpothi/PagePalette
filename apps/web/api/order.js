import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'Order API is working', 
      timestamp: new Date().toISOString() 
    });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderData, customerEmail, customerName, orderId } = req.body;

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
      const itemsList = orderData?.Items ? orderData.Items.split(',').map(item => item.trim()) : [];
      const itemsHtml = itemsList.map(item => `
        <tr>
          <td style="padding: 5px 0; color: #555;">${item}</td>
          <td style="padding: 5px 0; text-align: right; color: #555;"></td>
        </tr>
      `).join('');
      const totalAmount = orderData?.["Total Amount"] || '0.00';
      const paymentMethod = orderData?.["Payment Method"];

      try {
        await resend.emails.send({
          from: process.env.FROM_EMAIL ? `PagePalette Order Service <${process.env.FROM_EMAIL.split('<')[1] || process.env.FROM_EMAIL}>` : 'PagePalette Order Service <orders@resend.dev>',
          to: customerEmail,
          bcc: 'shirish.pothi.27@nexus.edu.sg',
          subject: `Welcome to PagePalette! (Order #${orderId})`,
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
          .action-card { background: #fff7ed; border: 1px solid #ffedd5; padding: 25px; border-radius: 12px; text-align: center; }
          .action-title { font-weight: bold; color: #9a3412; font-size: 18px; margin-bottom: 10px; }
          .action-value { font-family: monospace; font-size: 20px; font-weight: bold; background: rgba(255,255,255,0.5); padding: 8px 15px; border-radius: 6px; display: inline-block; margin: 10px 0; }
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
             <p class="message">
               We're so excited you've chosen PagePalette! Your customizable notebook order has been received. 
               We just need one last thing to get started immediately.
             </p>

             <div class="action-card">
                ${paymentMethod === 'PayNow' ? `
                   <div class="action-title">Pay via PayNow</div>
                   <p style="margin: 0 0 10px 0; font-size: 14px;">Please PayNow <strong>$${totalAmount}</strong> to:</p>
                   <div class="action-value">9123 4567</div>
                   <p style="font-size: 13px; color: #555; margin-top: 15px;">
                     Please send a screenshot of payment to <strong style="color: #ea580c;">shirish.pothi.27@nexus.edu.sg</strong>
                   </p>
                ` : `
                   <div class="action-title">Pay in Cash</div>
                   <p style="margin: 0 0 10px 0; font-size: 14px;">Please pay <strong>$${totalAmount}</strong> to:</p>
                   <div class="action-value" style="font-family: sans-serif;">Shirish Pothi or Julian Dizon</div>
                   <p style="font-size: 13px; color: #555; margin-top: 15px;">
                     Find us at school to collect your notebook and/or pay!
                   </p>
                `}
             </div>

             <br>

             <div class="receipt-box">
                <div style="font-weight: bold; margin-bottom: 15px; text-transform: uppercase; font-size: 12px; color: #888; letter-spacing: 1px;">Your Order Summary</div>
                <table style="width: 100%; border-collapse: collapse;">
                  ${itemsHtml}
                  <tr style="border-top: 1px solid #ddd;">
                    <td style="padding-top: 15px; font-weight: bold; font-size: 18px; color: #111;">Total</td>
                    <td style="padding-top: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #111;">$${totalAmount} SGD</td>
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

    return res.status(200).json({ success: true, orderId });

  } catch (error) {
    console.error("Order API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
