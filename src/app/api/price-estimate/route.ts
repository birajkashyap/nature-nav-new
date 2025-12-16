import { NextResponse } from "next/server";
import { 
  calculateDistanceBasedPrice, 
  calculateDeposit,
  determineRoute,
  calculateAirportTransferPrice 
} from "@/lib/pricing";
import { getActualDistance, isValidCoordinates } from "@/lib/distance";

/**
 * GET /api/price-estimate
 * 
 * Returns price estimate using the SAME logic as booking creation.
 * This ensures the estimate matches the actual payment amount.
 * 
 * Query params:
 * - pickupLat, pickupLng: Pickup coordinates
 * - dropLat, dropLng: Drop-off coordinates  
 * - pickup, drop: Address strings (for route-based fallback)
 * - vehicle: Vehicle name
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const pickupLat = parseFloat(searchParams.get("pickupLat") || "0");
    const pickupLng = parseFloat(searchParams.get("pickupLng") || "0");
    const dropLat = parseFloat(searchParams.get("dropLat") || "0");
    const dropLng = parseFloat(searchParams.get("dropLng") || "0");
    const pickup = searchParams.get("pickup") || "";
    const drop = searchParams.get("drop") || "";
    const vehicle = searchParams.get("vehicle") || "";

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle required" }, { status: 400 });
    }

    let totalPrice: number = 0;
    let distanceKm: number | null = null;
    let pricingMethod: string = "UNKNOWN";

    // Try distance-based pricing first (same logic as booking creation)
    if (
      pickupLat && pickupLng && dropLat && dropLng &&
      isValidCoordinates({ lat: pickupLat, lng: pickupLng }) &&
      isValidCoordinates({ lat: dropLat, lng: dropLng })
    ) {
      try {
        // Get actual driving distance from Google Distance Matrix API
        const distanceData = await getActualDistance(
          { lat: pickupLat, lng: pickupLng },
          { lat: dropLat, lng: dropLng }
        );
        
        distanceKm = distanceData.distanceKm;
        
        // Calculate price using tiered rates (same as booking)
        const pricing = calculateDistanceBasedPrice(distanceKm, vehicle);
        totalPrice = pricing.finalPrice;
        pricingMethod = "DISTANCE_BASED";
        
      } catch (distanceError) {
        console.error("Distance Matrix failed for estimate:", distanceError);
        // Fall through to route-based pricing
      }
    }

    // Fallback: Route-based pricing
    if (totalPrice === 0 && pickup && drop) {
      const route = determineRoute(pickup, drop);
      
      if (route) {
        totalPrice = calculateAirportTransferPrice(route, vehicle);
        pricingMethod = "ROUTE_BASED";
      }
    }

    // If still no price, return error
    if (totalPrice === 0) {
      return NextResponse.json(
        { error: "Unable to calculate price. Please select valid locations." },
        { status: 400 }
      );
    }

    // Calculate deposit (30%)
    const depositAmount = calculateDeposit(totalPrice);
    const remainingAmount = totalPrice - depositAmount;

    return NextResponse.json({
      success: true,
      distanceKm: distanceKm ? Math.round(distanceKm) : null,
      totalPrice: Math.round(totalPrice * 100) / 100,
      depositAmount: Math.round(depositAmount * 100) / 100,
      remainingAmount: Math.round(remainingAmount * 100) / 100,
      pricingMethod,
    });

  } catch (error: any) {
    console.error("Price estimate error:", error);
    return NextResponse.json(
      { error: "Failed to calculate price estimate" },
      { status: 500 }
    );
  }
}
