import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
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
                <p style="margin: 8px 0;"><strong>Bundle:</strong> ${orderData.Bundle}</p>
                <p style="margin: 8px 0;"><strong>Items:</strong> ${orderData.Items}</p>
                <p style="margin: 8px 0;"><strong>Total:</strong> $${orderData["Total Amount"]}</p>
                <p style="margin: 8px 0;"><strong>Payment Method:</strong> ${orderData["Payment Method"]}</p>
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
                <p><strong>Bundle:</strong> ${orderData.Bundle}</p>
                <p><strong>Items:</strong> ${orderData.Items}</p>
                <p><strong>Total:</strong> $${orderData["Total Amount"]}</p>
                <p><strong>Payment Method:</strong> ${orderData["Payment Method"]}</p>
                <p><strong>Role:</strong> ${orderData.Role}</p>
                ${orderData["Student Name"] !== "N/A" ? `<p><strong>Student:</strong> ${orderData["Student Name"]} (${orderData["Student Email"]})</p>` : ''}
                ${orderData.Year !== "N/A" ? `<p><strong>Year/Class:</strong> ${orderData.Year}/${orderData.Class}</p>` : ''}
              </div>
            `
          });
        } catch (adminEmailError) {
          console.error("Admin notification failed:", adminEmailError);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, orderId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Order API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
