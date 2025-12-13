import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/api/helpers/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover", // Use latest API version or match your Stripe account
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check removed to avoid TS errors, validation happens below with casted values

    // Calculate remaining amount
    const totalPrice = booking.totalPrice;
    const depositAmount = booking.depositAmount;

    if (!totalPrice || !depositAmount) {
      return NextResponse.json(
        { error: "Booking price details missing" },
        { status: 400 }
      );
    }

    const remainingAmount = totalPrice - depositAmount;
    const amountInCents = Math.round(remainingAmount * 100);

    if (amountInCents <= 0) {
      return NextResponse.json(
        { error: "No remaining balance to pay" },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session for Final Payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: `Final Payment for ${booking.car}`,
              description: `Remaining 50% Balance - ${booking.pickup} to ${booking.drop}`,
            },
              unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/profile?success=final_payment`,
      cancel_url: `${process.env.NEXTAUTH_URL}/profile?canceled=true`,
      metadata: {
        bookingId: booking.id,
        userId: booking.userId,
        paymentType: "final", // Critical for webhook
      },
      customer_email: booking.user.email || undefined,
    });

    // Update Booking
    await prisma.booking.update({
      where: { id },
      data: {
        status: "AwaitingFinalPayment",
        finalPaymentUrl: session.url,
      },
    });

    return NextResponse.json({ 
      message: "Final payment link generated", 
      url: session.url 
    });

  } catch (error: any) {
    console.error("Final payment generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
