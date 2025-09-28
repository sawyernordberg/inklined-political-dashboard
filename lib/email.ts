// Email utilities for sending thank you emails to supporters
import nodemailer from 'nodemailer';

interface ThankYouEmailData {
  to: string;
  name: string;
  amount: number;
  currency: string;
}

// Create transporter using your email service
// You can use Gmail, SendGrid, Mailgun, or any SMTP service
const createTransporter = () => {
  // Option 1: Gmail (requires app password)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // no-reply@theinklined.com
        pass: process.env.EMAIL_PASSWORD // App password for Gmail
      }
    });
  }

  // Option 2: Custom SMTP (recommended for production)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

export async function sendThankYouEmail(data: ThankYouEmailData): Promise<void> {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Inklined" <${process.env.EMAIL_FROM || 'no-reply@theinklined.com'}>`,
    to: data.to,
    subject: 'Thank you for supporting Inklined!',
    html: generateThankYouEmailHTML(data),
    text: generateThankYouEmailText(data)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Thank you email sent:', info.messageId);
  } catch (error) {
    console.error('Failed to send thank you email:', error);
    throw error;
  }
}

function generateThankYouEmailHTML(data: ThankYouEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank you for supporting Inklined</title>
      <style>
        body {
          font-family: Georgia, serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .container {
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1a1a1a;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .logo .accent {
          color: #0d9488;
          font-weight: 900;
        }
        .subtitle {
          color: #666;
          font-size: 0.9rem;
        }
        .content {
          margin: 30px 0;
        }
        .amount {
          background-color: #f0fdfa;
          border-left: 4px solid #0d9488;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
          font-size: 0.9rem;
        }
        .cta {
          display: inline-block;
          background-color: #0d9488;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            In<span class="accent">k</span>lined<span class="accent">.</span>
          </div>
          <div class="subtitle">Political Analysis & Data Transparency</div>
        </div>
        
        <div class="content">
          <h2>Thank you for your support, ${data.name}!</h2>
          
          <p>Your generous contribution of <strong>$${data.amount.toFixed(2)} ${data.currency}</strong> helps us continue providing comprehensive political analysis and maintaining transparency in government data.</p>
          
          <div class="amount">
            <strong>Donation Amount:</strong> $${data.amount.toFixed(2)} ${data.currency}<br>
            <strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          
          <p>Your support enables us to:</p>
          <ul>
            <li>Maintain real-time tracking of political promises and policy implementation</li>
            <li>Provide comprehensive analysis of government performance</li>
            <li>Keep our data sources transparent and accessible</li>
            <li>Continue our mission of political accountability</li>
          </ul>
          
          <p>We're committed to using your contribution responsibly to further our mission of political transparency and accountability.</p>
          
          <div style="text-align: center;">
            <a href="https://theinklined.com" class="cta">Visit Inklined</a>
          </div>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${data.to} because you made a donation to Inklined.</p>
          <p>If you have any questions about your donation, please contact us at support@theinklined.com</p>
          <p><strong>Inklined</strong> - Political Analysis & Data Transparency</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateThankYouEmailText(data: ThankYouEmailData): string {
  return `
Thank you for your support, ${data.name}!

Your generous contribution of $${data.amount.toFixed(2)} ${data.currency} helps us continue providing comprehensive political analysis and maintaining transparency in government data.

Donation Details:
- Amount: $${data.amount.toFixed(2)} ${data.currency}
- Date: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}

Your support enables us to:
- Maintain real-time tracking of political promises and policy implementation
- Provide comprehensive analysis of government performance
- Keep our data sources transparent and accessible
- Continue our mission of political accountability

We're committed to using your contribution responsibly to further our mission of political transparency and accountability.

Visit us at: https://theinklined.com

---
This email was sent to ${data.to} because you made a donation to Inklined.
If you have any questions about your donation, please contact us at support@theinklined.com

Inklined - Political Analysis & Data Transparency
  `;
}
