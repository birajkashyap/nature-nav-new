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
