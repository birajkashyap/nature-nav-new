import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed.", error.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  console.log("Webhook received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    const paymentIntentId = session.payment_intent as string;

    console.log("Processing checkout session for booking:", bookingId);

    if (bookingId) {
      try {
        // Idempotency Check: Fetch current status
        const existingBooking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });

        if (!existingBooking) {
            console.error("Booking not found:", bookingId);
            return NextResponse.json({ received: true });
        }

        const paymentType = session.metadata?.paymentType;

        if (paymentType === "final") {
             // Handle Final Payment
             await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    payment100: true,
                    status: "Completed",
                    completedAt: new Date(),
                    stripePaymentIntentId: paymentIntentId, // Update with latest intent
                } as any
             });
             console.log("Booking COMPLETED successfully:", bookingId);
        } else {
            // Handle Deposit (Default)
            if (existingBooking.status === "Approved" && existingBooking.payment50) {
                console.log("Booking already approved, skipping update:", bookingId);
                return NextResponse.json({ received: true });
            }

            await prisma.booking.update({
              where: { id: bookingId },
              data: {
                payment50: true,
                status: "Approved",
                stripePaymentIntentId: paymentIntentId,
              } as any,
            });
            console.log("Booking APPROVED (Deposit Paid):", bookingId);
        }
        console.log("Booking updated successfully:", bookingId);
      } catch (err) {
        console.error("Failed to update booking:", err);
        return NextResponse.json({ error: "Database Update Failed" }, { status: 500 });
      }
    } else {
      console.error("No bookingId found in session metadata");
    }
  }

  return NextResponse.json({ received: true });
}
