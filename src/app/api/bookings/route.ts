import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/app/api/helpers/auth";
import { calculatePrice, checkAvailability } from "@/lib/booking-logic";
import { 
  determineRoute, 
  calculateAirportTransferPrice, 
  calculateWeddingPrice,
  calculateDeposit,
  calculateDistanceBasedPrice,
} from "@/lib/pricing";
import { getActualDistance, isValidCoordinates } from "@/lib/distance";
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
      // Legacy fields (still required for backward compatibility)
      pickup, 
      drop, 
      // NEW: Structured location data
      pickupAddress,
      pickupPlaceId,
      pickupLat,
      pickupLng,
      dropAddress,
      dropPlaceId,
      dropLat,
      dropLng,
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

    if (!pickup && !pickupAddress || !drop && !dropAddress || !date || !car) {
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
    let totalPrice: number = 0;
    let depositAmount: number = 0;
    let basePrice: number | null = null;
    let hourlyRate: number | null = null;
    let route: string | null = null;
    let pricingMethod: string | null = null;
    let tierBreakdownJson: string | null = null;

    if (bookingType === "WEDDING_SHUTTLE") {
      // Wedding shuttle pricing
      const addOnTypes = addOns.map((a: any) => a.addOnType);
      const pricing = calculateWeddingPrice(car, additionalHours, addOnTypes);
      
      totalPrice = pricing.total;
      depositAmount = calculateDeposit(totalPrice);
      basePrice = pricing.basePrice;
      hourlyRate = pricing.hourlyRate;

    } else if (bookingType === "AIRPORT_TRANSFER") {
      // DYNAMIC DISTANCE-BASED PRICING
      // Try to use GPS coordinates for accurate pricing
      let distanceData: any = null;
      pricingMethod = "ROUTE_BASED"; // Default fallback
      
      if (
        pickupLat && pickupLng && dropLat && dropLng &&
        isValidCoordinates({ lat: pickupLat, lng: pickupLng }) &&
        isValidCoordinates({ lat: dropLat, lng: dropLng })
      ) {
        try {
          console.log('📍 Calculating distance-based pricing...');
          
          // Get actual driving distance from Google Distance Matrix API
          distanceData = await getActualDistance(
            { lat: pickupLat, lng: pickupLng },
            { lat: dropLat, lng: dropLng }
          );
          
          // Calculate price using tiered rates
          const pricing = calculateDistanceBasedPrice(
            distanceData.distanceKm,
            car
          );
          
          totalPrice = pricing.finalPrice;
          pricingMethod = "DISTANCE_BASED";
          tierBreakdownJson = JSON.stringify(pricing.tierBreakdown);
          
          console.log(`✅ Distance-based pricing: ${distanceData.distanceKm.toFixed(1)} km = $${totalPrice.toFixed(2)}`);
          
        } catch (distanceError: any) {
          console.error('❌ Distance Matrix failed, falling back to route-based pricing:', distanceError.message);
          // Fall through to route-based pricing below
        }
      }
      
      // FALLBACK: Route-based pricing (legacy system)
      if (!distanceData) {
        console.log('📌 Using legacy route-based pricing...');
        route = determineRoute(pickup, drop);
        
        if (!route) {
          return NextResponse.json(
            { 
              error: "Unable to determine route. Please select locations from the autocomplete dropdown for accurate pricing." 
            },
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
        
        pricingMethod = "ROUTE_BASED";
      }
      
      depositAmount = calculateDeposit(totalPrice);
      
      // Store distance data and pricing method for analytics
      basePrice = distanceData?.distanceKm || null; // Using basePrice to store distance for airport transfers
      hourlyRate = distanceData?.durationSeconds || null; // Using hourlyRate to store duration for airport transfers
      
    } else {
      return NextResponse.json({ error: "Invalid booking type" }, { status: 400 });
    }

    // 4. Create Booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        // Legacy fields (backward compatibility)
        pickup,
        drop,
        // NEW: Structured location data (if provided)
        pickupAddress: pickupAddress || pickup,
        pickupPlaceId: pickupPlaceId || null,
        pickupLat: pickupLat !== undefined ? pickupLat : null,
        pickupLng: pickupLng !== undefined ? pickupLng : null,
        dropAddress: dropAddress || drop,
        dropPlaceId: dropPlaceId || null,
        dropLat: dropLat !== undefined ? dropLat : null,
        dropLng: dropLng !== undefined ? dropLng : null,
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
        // Distance-based pricing data
        calculatedDistance: basePrice, // Stored in basePrice for airport transfers
        estimatedDuration: hourlyRate ? Number(hourlyRate) : null, // Stored in hourlyRate for airport transfers
        pricingMethod,
        priceTierBreakdown: tierBreakdownJson,
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
            unit_amount: Math.round(depositAmount * 100),
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
