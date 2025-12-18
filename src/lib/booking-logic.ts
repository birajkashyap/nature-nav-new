import { prisma } from "@/lib/prisma";

// Mock pricing configuration
const PRICING = {
  BASE_FARE: 50, // Base fee in CAD
  PER_KM: 2.5,   // Price per km
  MIN_FARE: 100, // Minimum fare
  DEPOSIT_PERCENTAGE: 0.35, // 35% deposit
};

// Mock distance calculator (deterministic based on string length)
// In a real app, this would use Google Maps API
function calculateMockDistance(pickup: string, drop: string): number {
  const combinedLength = pickup.length + drop.length;
  // Generate a "random" but deterministic distance between 10km and 100km
  const distance = (combinedLength * 7) % 90 + 10; 
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

export interface PriceDetails {
  distanceKm: number;
  totalPrice: number;
  depositAmount: number;
}

export function calculatePrice(pickup: string, drop: string, carType: string): PriceDetails {
  const distanceKm = calculateMockDistance(pickup, drop);
  
  let price = PRICING.BASE_FARE + (distanceKm * PRICING.PER_KM);
  
  // Add car type multiplier
  if (carType.toLowerCase().includes("suv") || carType.toLowerCase().includes("van")) {
    price *= 1.2; // 20% extra for larger vehicles
  } else if (carType.toLowerCase().includes("limo")) {
    price *= 1.5; // 50% extra for limos
  }

  // Ensure minimum fare
  price = Math.max(price, PRICING.MIN_FARE);
  
  // Round to 2 decimal places
  const totalPrice = Math.round(price * 100) / 100;
  const depositAmount = Math.round(totalPrice * PRICING.DEPOSIT_PERCENTAGE * 100) / 100;

  return {
    distanceKm,
    totalPrice,
    depositAmount,
  };
}

export async function checkAvailability(car: string, date: Date): Promise<boolean> {
  // Define a time window (e.g., +/- 2 hours)
  const windowHours = 2;
  const startTime = new Date(date.getTime() - windowHours * 60 * 60 * 1000);
  const endTime = new Date(date.getTime() + windowHours * 60 * 60 * 1000);

  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      car,
      status: {
        notIn: ["Cancelled", "Completed"], // Only check active bookings
      },
      date: {
        gte: startTime,
        lte: endTime,
      },
    },
  });

  return !conflictingBooking;
}
