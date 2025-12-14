// Vercel Serverless API Route for Order Submission
import { Resend } from 'resend';

// Initialize Resend conditionally (avoid during build)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SHEETDB_URL = "https://sheetdb.io/api/v1/i3ywkjbojouc9";

// Security: Input sanitization helper
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"&]/g, (char) => {
      const entities = { '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '&': '&amp;' };
      return entities[char] || char;
    })
    .trim()
    .slice(0, 500);
};

// Security: Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email) && email.length <= 254;
};

// Security: Validate order total
const validateTotal = (items, total) => {
  const numTotal = parseFloat(total);
  if (isNaN(numTotal) || numTotal < 0 || numTotal > 1000) return false;
  return true;
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

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set');
      return res.status(500).json({ 
        success: false, 
        error: 'Email service configuration error' 
      });
    }

    const body = req.body;
    
    const {
      orderId,
      name,
      email,
      role,
      items,
      total,
      paymentMethod,
      position,
      classroom,
      studentName,
      studentEmail,
      year,
      classCode
    } = body;

    if (!orderId || !name || !email || !items || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validateTotal(items, total)) {
      return res.status(400).json({ error: 'Invalid order total' });
    }

    const validRoles = ['student', 'parent', 'teacher'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const validPaymentMethods = ['paynow', 'cash'];
    if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedItems = sanitizeInput(items);
    const sanitizedPosition = sanitizeInput(position || '');
    const sanitizedClassroom = sanitizeInput(classroom || '');
    const sanitizedStudentName = sanitizeInput(studentName || '');
    const sanitizedYear = sanitizeInput(year || '');
    const sanitizedClassCode = sanitizeInput(classCode || '');
    const sanitizedStudentEmail = studentEmail && isValidEmail(studentEmail) ? studentEmail : '';

    const isPayNow = paymentMethod === 'paynow';
    const orderDate = new Date().toISOString().replace('T', ' ').split('.')[0];

    const sheetPayload = {
      "Order ID": sanitizeInput(orderId),
      "Date": orderDate,
      "Order Type": "Pre-Order",
      "Bundle": sanitizedItems.includes("Starter") ? "Starter Bundle" : "Complete Bundle",
      "Name": sanitizedName,
      "Email": email,
      "Role": role || "N/A",
      "Student Name": sanitizedStudentName || "N/A",
      "Student Email": sanitizedStudentEmail || "N/A",
      "Year": sanitizedYear || "N/A",
      "Class": sanitizedClassCode || "N/A",
      "Position": sanitizedPosition || "N/A",
      "Room": sanitizedClassroom || "N/A",
      "Items": sanitizedItems,
      "Total Amount": parseFloat(total).toFixed(2),
      "Payment Method": paymentMethod || "N/A",
      "Status": "Pending Payment"
    };

    const htmlEmail = `
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
          .item-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #555; }
          .total-row { display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; font-weight: bold; font-size: 18px; color: #111; }
          .action-card { background: ${isPayNow ? '#f0fdf4' : '#fff7ed'}; border: 1px solid ${isPayNow ? '#bbf7d0' : '#ffedd5'}; padding: 25px; border-radius: 12px; text-align: center; }
          .action-title { font-weight: bold; color: ${isPayNow ? '#166534' : '#9a3412'}; font-size: 18px; margin-bottom: 10px; }
          .action-value { font-family: monospace; font-size: 20px; font-weight: bold; background: rgba(255,255,255,0.5); padding: 8px 15px; border-radius: 6px; display: inline-block; margin: 10px 0; }
          .footer { background: #f4f4f5; padding: 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
             <div class="logo-text">PagePalette</div>
             <div class="logo-sub">Order #${sanitizeInput(orderId)}</div>
          </div>
          
          <div class="content">
             <div class="greeting">Hi ${sanitizedName}! 👋</div>
             <p class="message">
               We're so excited you've chosen PagePalette! Your customizable notebook order has been received. 
               We just need one last thing to get started immediately.
             </p>

             <div class="action-card">
                ${isPayNow ? `
                   <div class="action-title">Final Step: Payment via PayNow</div>
                   <p style="margin: 0 0 10px 0; font-size: 14px;">Please transfer <strong>$${parseFloat(total).toFixed(2)}</strong> to:</p>
                   <div class="action-value">+65 8301 0149 (Nicole Xu)</div>
                   <p style="font-size: 13px; color: #555; margin-top: 15px;">
                     <strong>Important:</strong> Please reply to this email with a screenshot of your payment receipt so we can verify it!
                   </p>
                ` : `
                   <div class="action-title">Pay in Cash</div>
                   <p style="margin: 0 0 10px 0; font-size: 14px;">Please pay <strong>$${parseFloat(total).toFixed(2)}</strong> to:</p>
                   <div class="action-value" style="font-family: sans-serif;">Shirish Pothi or Julian Dizon</div>
                   <p style="font-size: 13px; color: #555; margin-top: 15px;">
                     Find us at school to collect your notebook! 🌟
                   </p>
                `}
             </div>

             <br>

             <div class="receipt-box">
                <div style="font-weight: bold; margin-bottom: 15px; text-transform: uppercase; font-size: 12px; color: #888; letter-spacing: 1px;">Your Order Summary</div>
                ${sanitizedItems.split(', ').map(item => `
                  <div class="item-row">
                    <span>${sanitizeInput(item)}</span>
                  </div>
                `).join('')}
                <div class="total-row">
                   <span>Total</span>
                   <span>$${parseFloat(total).toFixed(2)} SGD</span>
                </div>
             </div>
          </div>
          
          <div class="footer">
             <p>Sent with ❤️ by the PagePalette Team</p>
             <p>A Junior Achievement Singapore Company: PagePalette • © 2025</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const [sheetResult, emailResult] = await Promise.allSettled([
      fetch(SHEETDB_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SHEETDB_API_TOKEN}`
        },
        body: JSON.stringify({ data: [sheetPayload] })
      }).then(async response => {
        if (!response.ok) {
          const txt = await response.text();
          throw new Error(`SheetDB Status: ${response.status} - ${txt}`);
        }
        return response.json();
      }),

      resend.emails.send({
        from: "PagePalette Order Service <order@pagepalette.tech>",
        to: [email],
        bcc: ["shirish.pothi.27@nexus.edu.sg"],
        subject: `Welcome to PagePalette! (Order #${orderId})`,
        html: htmlEmail,
      })
    ]);

    if (sheetResult.status === 'rejected') console.error("SheetDB Failure:", sheetResult.reason);
    if (emailResult.status === 'rejected') console.error("Email Failure:", emailResult.reason);

    return res.status(200).json({
      success: true,
      sheet: sheetResult.status === 'fulfilled',
      email: emailResult.status === 'fulfilled'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
