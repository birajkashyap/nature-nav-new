import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResetToken, hashToken } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";

// Simple in-memory rate limiting
const resetRequests = new Map<string, number[]>();
const MAX_REQUESTS = 3;
const TIME_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(email: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const timestamps = resetRequests.get(email) || [];
  
  // Remove timestamps older than 1 hour
  const recentTimestamps = timestamps.filter(t => now - t < TIME_WINDOW);
  
  if (recentTimestamps.length >= MAX_REQUESTS) {
    return {
      allowed: false,
      message: "Too many reset requests. Please try again in 1 hour."
    };
  }
  
  // Add current timestamp
  recentTimestamps.push(now);
  resetRequests.set(email, recentTimestamps);
  
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Rate limiting check
    const rateLimitCheck = checkRateLimit(email.toLowerCase());
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: rateLimitCheck.message },
        { status: 429 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { accounts: true }
    });

    // For security: Always return success even if email doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      // Still wait a bit to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100));
      return NextResponse.json({
        message: "If an account exists with that email, we've sent a password reset link."
      });
    }

    // Check if user has a password (not OAuth-only)
    if (!user.password) {
      // User is OAuth-only (e.g., Google sign-in)
      // Don't reveal this info - response is same as success
      return NextResponse.json({
        message: "If an account exists with that email, we've sent a password reset link."
      });
    }

    // Generate reset token
    const plainToken = generateResetToken();
    const hashedTokenValue = hashToken(plainToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedTokenValue,
        expires: expiresAt
      }
    });

    // Send reset email with plain token (not hashed)
    await sendPasswordResetEmail(email, plainToken);

    return NextResponse.json({
      message: "If an account exists with that email, we've sent a password reset link."
    });

  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
