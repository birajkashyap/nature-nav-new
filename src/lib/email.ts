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
      subject: `Thank You for Booking with Nature Navigator Shuttle Services`,
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
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                margin-bottom: 30px;
              }
              .content p {
                margin-bottom: 15px;
                color: #333;
              }
              .phone {
                font-weight: 600;
                color: #D4AF37;
                font-size: 16px;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
              }
              .company-name {
                color: #D4AF37;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <p style="margin: 0;"><strong>Hi ${customerName || 'Valued Customer'},</strong></p>
              </div>
              
              <div class="content">
                <p>Thank you for booking with Nature Navigator Shuttle Services. We truly appreciate the opportunity to be part of your special event.</p>
                
                <p>Please rest assured — we will plan and coordinate everything for you to ensure smooth, reliable, and stress-free transportation on your wedding day. If you have any questions, changes, or special requests, simply give us a call and we'll take care of the rest.</p>
                
                <p class="phone">Phone: <a href="tel:+14379904858" style="color: #D4AF37; text-decoration: none;">+1 (437) 990-4858</a></p>
                
                <p>Kindly review and sign the attached Terms & Conditions to confirm your booking. Once signed, please reply to this email with the completed document.</p>
                
                <p>If you need any assistance at all, we're just a call away.</p>
                
                <p>Thank you again for choosing Nature Navigator Shuttle Services. We look forward to serving you.</p>
              </div>
              
              <div class="footer">
                <p style="margin: 5px 0;"><strong>Warm regards,</strong></p>
                <p style="margin: 5px 0;" class="company-name">Nature Navigator Shuttle Services Ltd.</p>
                <p style="margin: 5px 0;">Phone: <a href="tel:+14379904858" style="color: #D4AF37; text-decoration: none;">+1 (437) 990-4858</a></p>
                <p style="margin: 5px 0;">Email: <a href="mailto:info@naturenavigatorshuttle.ca" style="color: #D4AF37; text-decoration: none;">info@naturenavigatorshuttle.ca</a></p>
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
