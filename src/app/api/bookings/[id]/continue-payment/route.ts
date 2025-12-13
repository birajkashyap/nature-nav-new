import { NextResponse } from "next/server";
import { getUserId } from "@/app/api/helpers/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;

    // 🔒 SECURITY CHECK 1: Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { addOns: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 🔒 SECURITY CHECK 2: Verify ownership
    if (booking.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 🔒 SECURITY CHECK 3: Already paid?
    if (booking.payment50 === true) {
      return NextResponse.json(
        { 
          error: "This booking is already paid! Please refresh the page.",
          alreadyPaid: true 
        },
        { status: 400 }
      );
    }

    // 🔒 SECURITY CHECK 4: Status validation
    if (booking.status !== "Pending") {
      return NextResponse.json(
        { error: `Cannot process payment for ${booking.status} booking` },
        { status: 400 }
      );
    }

    // 🔒 SECURITY CHECK 5: Validate deposit amount exists
    if (!booking.depositAmount || booking.depositAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid booking amount" },
        { status: 400 }
      );
    }

    // ✅ Create NEW Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: booking.bookingType === "WEDDING_SHUTTLE"
                ? `Wedding Shuttle Service - 50% Deposit`
                : `${booking.car} - 50% Deposit`,
              description: booking.bookingType === "WEDDING_SHUTTLE"
                ? `Event Date: ${new Date(booking.date).toLocaleDateString()}`
                : `${booking.pickup} to ${booking.drop} on ${new Date(booking.date).toLocaleDateString()}`,
            },
            unit_amount: Math.round(booking.depositAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/profile?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/profile`,
      client_reference_id: booking.id,
      metadata: {
        bookingId: booking.id,
        userId,
        bookingType: booking.bookingType || "AIRPORT_TRANSFER",
        isRetry: "true",
      },
    });

    // ✅ Update booking with NEW session ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        stripeSessionId: session.id,
        updatedAt: new Date(),
      },
    });

    console.log(`Created new payment session for booking ${bookingId} (retry)`);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Continue payment error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create payment session",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
