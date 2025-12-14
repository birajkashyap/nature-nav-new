import crypto from "crypto";

/**
 * Generate a secure random token for password reset
 * @returns {string} 32-byte hex string
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a token for secure storage in database
 * @param token - Plain text token
 * @returns {string} SHA-256 hashed token
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Validate a plain token against its hashed version
 * @param token - Plain text token to validate
 * @param hashedToken - Hashed token from database
 * @returns {boolean} True if tokens match
 */
export function validateToken(token: string, hashedToken: string): boolean {
  const tokenHash = hashToken(token);
  return tokenHash === hashedToken;
}

/**
 * Check if a reset token has expired
 * @param expiresAt - Expiration date from database
 * @returns {boolean} True if token is expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
