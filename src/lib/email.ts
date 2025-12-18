import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Nature Navigator <onboarding@resend.dev>"; // Update with verified domain
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

/**
 * Send password reset email with reset link
 * @param email - User's email address
 * @param token - Plain text reset token (not hashed)
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetLink = `${APP_URL}/reset-password/confirm?token=${token}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset Your Password - Nature Navigator",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                padding: 40px;
                border-radius: 12px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #1a1a1a;
                font-size: 28px;
                margin: 0;
                font-weight: 600;
              }
              .content {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .button {
                display: inline-block;
                padding: 14px 32px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
                transition: transform 0.2s;
              }
              .button:hover {
                transform: translateY(-2px);
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 14px;
                color: #666;
              }
              .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 12px;
                margin: 20px 0;
                border-radius: 4px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset Request</h1>
              </div>
              
              <div class="content">
                <p>Hello,</p>
                
                <p>We received a request to reset your password for your Nature Navigator account. Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                  <a href="${resetLink}" class="button">Reset Password</a>
                </div>
                
                <div class="warning">
                  <strong>⏰ This link expires in 1 hour</strong> for your security.
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea; font-size: 13px;">${resetLink}</p>
                
                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
                  <strong>Didn't request a password reset?</strong><br>
                  You can safely ignore this email. Your password will not be changed.
                </p>
              </div>
              
              <div class="footer">
                <p style="margin: 5px 0;">Nature Navigator</p>
                <p style="margin: 5px 0; color: #999;">Premium Chauffeur Services | Canadian Rockies</p>
                <p style="margin: 5px 0; font-size: 12px; color: #999;">107 Armstrong Place, Canmore, Alberta</p>
                <p style="margin: 5px 0; font-size: 12px; color: #999;">info@naturenavigator.ca</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Failed to send reset email");
  }
}

/**
 * Booking confirmation details interface
 */
export interface BookingDetails {
  id: string;
  car: string;
  pickup: string;
  drop: string;
  date: Date;
  totalPrice: number;
  depositAmount: number;
  bookingType?: string;
}

/**
 * Send booking confirmation email after deposit payment
 * @param email - User's email address
 * @param booking - Booking details
 */
export async function sendBookingConfirmationEmail(
  email: string,
  customerName: string,
  booking: BookingDetails
): Promise<void> {
  const profileLink = `${APP_URL}/profile`;
  const remainingAmount = (booking.totalPrice - booking.depositAmount).toFixed(2);
  const formattedDate = new Date(booking.date).toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Booking Confirmed! - Nature Navigator Shuttle Services`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
              }
              .container {
                background: #1a1a1a;
                padding: 40px;
                border-radius: 12px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #D4AF37;
                font-size: 28px;
                margin: 0;
                font-weight: 600;
              }
              .success-badge {
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                color: white;
                padding: 8px 20px;
                border-radius: 20px;
                display: inline-block;
                font-size: 14px;
                font-weight: 600;
                margin: 15px 0;
              }
              .content {
                background: #262626;
                padding: 30px;
                border-radius: 8px;
                border-left: 4px solid #D4AF37;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid #333;
              }
              .detail-label {
                color: #999;
                font-size: 14px;
              }
              .detail-value {
                color: #fff;
                font-weight: 600;
                text-align: right;
              }
              .payment-section {
                background: #1f1f1f;
                padding: 20px;
                border-radius: 8px;
                margin-top: 20px;
              }
              .payment-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                color: #ccc;
              }
              .payment-row.highlight {
                color: #22c55e;
                font-weight: 600;
              }
              .payment-row.remaining {
                color: #D4AF37;
                font-weight: 600;
                border-top: 1px solid #333;
                padding-top: 12px;
                margin-top: 8px;
              }
              .button {
                display: inline-block;
                padding: 14px 32px;
                background: linear-gradient(135deg, #D4AF37 0%, #B8962E 100%);
                color: #1a1a1a !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 14px;
                color: #666;
              }
              .booking-id {
                font-family: monospace;
                background: #333;
                padding: 4px 8px;
                border-radius: 4px;
                color: #D4AF37;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚐 Nature Navigator</h1>
                <div class="success-badge">✓ Booking Confirmed</div>
              </div>
              
              <div class="content">
                <p style="color: #fff; margin-top: 0;">Hello ${customerName || 'Valued Customer'},</p>
                
                <p style="color: #ccc;">Thank you for booking with Nature Navigator Shuttle Services! Your deposit has been received and your booking is now confirmed.</p>
                
                <div class="detail-row">
                  <span class="detail-label">Booking ID</span>
                  <span class="booking-id">${booking.id.slice(-8).toUpperCase()}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Vehicle</span>
                  <span class="detail-value">${booking.car}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Pickup</span>
                  <span class="detail-value">${booking.pickup}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Drop-off</span>
                  <span class="detail-value">${booking.drop}</span>
                </div>
                
                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Date & Time</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                
                <div class="payment-section">
                  <p style="color: #fff; margin: 0 0 15px 0; font-weight: 600;">Payment Summary</p>
                  <div class="payment-row">
                    <span>Total Price</span>
                    <span>C$${booking.totalPrice.toFixed(2)}</span>
                  </div>
                  <div class="payment-row highlight">
                    <span>✓ Deposit Paid (35%)</span>
                    <span>C$${booking.depositAmount.toFixed(2)}</span>
                  </div>
                  <div class="payment-row remaining">
                    <span>Remaining Balance (65%)</span>
                    <span>C$${remainingAmount}</span>
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                  <a href="${profileLink}" class="button">View My Booking</a>
                </div>
                
                <p style="color: #999; font-size: 13px; margin-top: 25px;">
                  For any questions or changes, please contact us at 
                  <a href="mailto:info@naturenavigatorshuttle.ca" style="color: #D4AF37;">info@naturenavigatorshuttle.ca</a> 
                  or call <a href="tel:+14379904858" style="color: #D4AF37;">+1 (437) 990-4858</a>
                </p>
              </div>
              
              <div class="footer">
                <p style="margin: 5px 0; color: #D4AF37;">Nature Navigator Shuttle Services Ltd.</p>
                <p style="margin: 5px 0; color: #666;">Premium Chauffeur Services | Canadian Rockies</p>
                <p style="margin: 5px 0; font-size: 12px; color: #555;">107 Armstrong Place, Canmore, Alberta</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    console.log(`✅ Booking confirmation email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
    // Don't throw - we don't want to fail the webhook if email fails
  }
}
