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
  const depositPercentage = ((booking.depositAmount / booking.totalPrice) * 100).toFixed(0);
  const remainingPercentage = (100 - parseFloat(depositPercentage)).toFixed(0);
  
  const formattedDate = new Date(booking.date).toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Customize content based on booking type
  const isWedding = booking.bookingType === 'WEDDING_SHUTTLE';
  const isAirportTransfer = booking.bookingType === 'AIRPORT_TRANSFER';
  const isEngagement = booking.bookingType === 'ENGAGEMENT';
  const isCeremony = booking.bookingType === 'CEREMONY_HOTEL_VISTA';

  let serviceTypeText = 'your transportation service';
  let eventTypeText = 'your event';
  
  if (isWedding) {
    serviceTypeText = 'your wedding shuttle service';
    eventTypeText = 'your wedding day';
  } else if (isAirportTransfer) {
    serviceTypeText = 'your airport transfer';
    eventTypeText = 'your journey';
  } else if (isEngagement) {
    serviceTypeText = 'your engagement service';
    eventTypeText = 'your special day';
  } else if (isCeremony) {
    serviceTypeText = 'your ceremony transportation';
    eventTypeText = 'your ceremony';
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Booking Confirmed - Nature Navigator ${isWedding ? 'Wedding Shuttle' : isAirportTransfer ? 'Airport Transfer' : 'Shuttle Services'}`,
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
              .booking-details {
                background: #f9f9f9;
                border-left: 4px solid #D4AF37;
                padding: 20px;
                margin: 25px 0;
                border-radius: 4px;
              }
              .booking-details h3 {
                margin-top: 0;
                color: #333;
                font-size: 16px;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
              }
              .detail-row:last-child {
                border-bottom: none;
              }
              .detail-label {
                font-weight: 600;
                color: #666;
              }
              .detail-value {
                color: #333;
                text-align: right;
              }
              .payment-summary {
                background: #e8f5e9;
                border: 2px solid #4caf50;
                padding: 20px;
                margin: 25px 0;
                border-radius: 6px;
              }
              .payment-summary h3 {
                margin-top: 0;
                color: #2e7d32;
                font-size: 18px;
              }
              .payment-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                font-size: 16px;
              }
              .payment-row.total {
                border-top: 2px solid #4caf50;
                margin-top: 10px;
                padding-top: 15px;
                font-weight: 700;
                font-size: 18px;
                color: #2e7d32;
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
              .success-badge {
                display: inline-block;
                background: #4caf50;
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 15px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <span class="success-badge">✓ Booking Confirmed</span>
                <p style="margin: 10px 0 0 0;"><strong>Hi ${customerName || 'Valued Customer'},</strong></p>
              </div>
              
              <div class="content">
                <p>Thank you for booking with Nature Navigator Shuttle Services. We truly appreciate the opportunity to be part of ${eventTypeText}.</p>
                
                <div class="booking-details">
                  <h3>📋 Booking Details</h3>
                  <div class="detail-row">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value">${booking.id}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Service Date:</span>
                    <span class="detail-value">${formattedDate}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Vehicle:</span>
                    <span class="detail-value">${booking.car}</span>
                  </div>
                  ${!isWedding ? `
                  <div class="detail-row">
                    <span class="detail-label">Pickup:</span>
                    <span class="detail-value">${booking.pickup}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Drop-off:</span>
                    <span class="detail-value">${booking.drop}</span>
                  </div>
                  ` : `
                  <div class="detail-row">
                    <span class="detail-label">Event Venue:</span>
                    <span class="detail-value">${booking.pickup}</span>
                  </div>
                  `}
                </div>

                <div class="payment-summary">
                  <h3>💰 Payment Summary</h3>
                  <div class="payment-row">
                    <span>Total Service Cost:</span>
                    <span><strong>$${booking.totalPrice.toFixed(2)} CAD</strong></span>
                  </div>
                  <div class="payment-row" style="color: #4caf50;">
                    <span>✓ Deposit Paid (${depositPercentage}%):</span>
                    <span><strong>$${booking.depositAmount.toFixed(2)} CAD</strong></span>
                  </div>
                  <div class="payment-row total">
                    <span>Remaining Balance (${remainingPercentage}%):</span>
                    <span>$${remainingAmount} CAD</span>
                  </div>
                </div>
                
                ${isWedding ? `
                <p>Please rest assured — we will plan and coordinate everything for you to ensure smooth, reliable, and stress-free transportation on your wedding day. If you have any questions, changes, or special requests, simply give us a call and we'll take care of the rest.</p>
                ` : `
                <p>Your booking is confirmed and we're all set for ${eventTypeText}. Our professional chauffeur will ensure a comfortable and timely ${isAirportTransfer ? 'transfer' : 'service'}. If you have any questions or need to make changes, we're here to help.</p>
                `}
                
                <p class="phone">Phone: <a href="tel:+14379904858" style="color: #D4AF37; text-decoration: none;">+1 (437) 990-4858</a></p>
                
                ${isWedding ? `
                <p>Kindly review and sign the attached Terms & Conditions to confirm your booking. Once signed, please reply to this email with the completed document.</p>
                ` : ''}
                
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

