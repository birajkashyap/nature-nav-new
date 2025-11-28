import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/app/api/helpers/auth";
import { calculatePrice, checkAvailability } from "@/lib/booking-logic";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { pickup, drop, date, car } = body;

    if (!pickup || !drop || !date || !car) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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

    // 3. Calculate Price
    const { totalPrice, depositAmount, distanceKm } = calculatePrice(pickup, drop, car);

    // 4. Create Booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        pickup,
        drop,
        date: bookingDate,
        car,
        status: "Pending",
        totalPrice,
        depositAmount,
      },
    });

    return NextResponse.json({ 
      booking,
      priceDetails: { totalPrice, depositAmount, distanceKm } 
    }, { status: 201 });

  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
