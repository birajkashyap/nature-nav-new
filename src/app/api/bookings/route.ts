import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/app/api/helpers/auth";
import { calculatePrice, checkAvailability } from "@/lib/booking-logic";
import { 
  determineRoute, 
  calculateAirportTransferPrice, 
  calculateWeddingPrice,
  calculateDeposit 
} from "@/lib/pricing";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      pickup, 
      drop, 
      date, 
      car,
      notes = "",
      bookingType = "AIRPORT_TRANSFER",
      // Wedding-specific fields
      eventStartTime,
      eventEndTime,
      additionalHours = 0,
      addOns = [],
    } = body;

    if (!pickup || !drop || !date || !car) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bookingDate = new Date(date);

    // 1. Check for active booking (User Constraint)
    const activeBooking = await prisma.booking.findFirst({
      where: {
        userId,
        status: {
          notIn: ["Completed", "Cancelled"],
        },
      },
    });

    if (activeBooking) {
      return NextResponse.json(
        { error: "You already have an active booking." },
        { status: 409 }
      );
    }

    // 2. Check Availability (Car Constraint)
    const isAvailable = await checkAvailability(car, bookingDate);
    if (!isAvailable) {
      return NextResponse.json(
        { error: `The ${car} is not available at this time. Please choose another slot.` },
        { status: 409 }
      );
    }

    // 3. Calculate Price based on booking type
    let totalPrice: number;
    let depositAmount: number;
    let basePrice: number | null = null;
    let hourlyRate: number | null = null;
    let route: string | null = null;

    if (bookingType === "WEDDING_SHUTTLE") {
      // Wedding shuttle pricing
      const addOnTypes = addOns.map((a: any) => a.addOnType);
      const pricing = calculateWeddingPrice(car, additionalHours, addOnTypes);
      
      basePrice = pricing.basePrice;
      hourlyRate = pricing.hourlyRate;
      totalPrice = pricing.total;
      depositAmount = calculateDeposit(totalPrice);
      
    } else if (bookingType === "AIRPORT_TRANSFER") {
      // Airport transfer pricing (existing logic)
      route = determineRoute(pickup, drop);
      if (!route) {
        return NextResponse.json(
          { error: "Unable to determine route. Please check pickup and drop locations." },
          { status: 400 }
        );
      }
      
      totalPrice = calculateAirportTransferPrice(route, car);
      if (totalPrice === 0) {
        return NextResponse.json(
          { error: "Invalid route or vehicle selection." },
          { status: 400 }
        );
      }
      
      depositAmount = calculateDeposit(totalPrice);
      
    } else {
      return NextResponse.json({ error: "Invalid booking type" }, { status: 400 });
    }

    // 4. Create Booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        pickup,
        drop,
        date: bookingDate,
        car,
        notes,
        status: "Pending",
        payment50: false,
        payment100: false,
        totalPrice,
        depositAmount,
        bookingType,
        // Wedding-specific fields
        eventStartTime: eventStartTime ? new Date(eventStartTime) : null,
        eventEndTime: eventEndTime ? new Date(eventEndTime) : null,
        basePrice,
        hourlyRate,
        additionalHours,
        // Airport-specific
        route,
      },
    });

    // 5. Create add-ons if any (for wedding bookings)
    if (addOns.length > 0) {
      await prisma.bookingAddOn.createMany({
        data: addOns.map((addOn: any) => ({
          bookingId: booking.id,
          addOnType: addOn.addOnType,
          serviceName: addOn.serviceName,
          price: addOn.price,
          duration: addOn.duration || null,
          pickupLocation: addOn.pickupLocation || null,
          dropLocation: addOn.dropLocation || null,
          notes: addOn.notes || null,
        })),
      });
    }

    // 6. Create Stripe Checkout Session for deposit payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: bookingType === "WEDDING_SHUTTLE" 
                ? `Wedding Shuttle Service - 50% Deposit`
                : `${car} - 50% Deposit`,
              description: bookingType === "WEDDING_SHUTTLE"
                ? `Event Date: ${new Date(date).toLocaleDateString()} | Venue: ${pickup}`
                : `${pickup} to ${drop} on ${new Date(date).toLocaleDateString()}`,
            },
            unit_amount: 60, // TEMPORARY TEST: 0.6 CAD - ROLLBACK AFTER TESTING!
            // unit_amount: Math.round(depositAmount * 100), // ORIGINAL - RESTORE THIS!
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/profile?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/contact?cancelled=true`,
      client_reference_id: booking.id,
      metadata: {
        bookingId: booking.id,
        userId,
        bookingType,
      },
    });

    // Update booking with Stripe session ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json(
      {
        booking,
        checkoutUrl: session.url,
        priceDetails: { totalPrice, depositAmount, route, bookingType },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    // Log more specific Prisma errors
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
