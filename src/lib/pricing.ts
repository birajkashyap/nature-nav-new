// Pricing configuration and calculation helpers for Nature Navigator

export const AIRPORT_ROUTES = {
  'YYC-Canmore': {
    'Luxury SUV (5 Passengers)': 518.44,
    'Transit Van (14 Passengers)': 685.13,
  },
  'YYC-Banff': {
    'Luxury SUV (5 Passengers)': 681.45,
    'Transit Van (14 Passengers)': 897,
  },
  'Canmore-YYC': {
    'Luxury SUV (5 Passengers)': 518.44,
    'Transit Van (14 Passengers)': 685.13,
  },
  'Banff-YYC': {
    'Luxury SUV (5 Passengers)': 681.45,
    'Transit Van (14 Passengers)': 897,
  },
} as const;

export const WEDDING_SHUTTLE = {
  basePrice: 850,
  baseHours: 4,
  hourlyRates: {
    'Luxury SUV (5 Passengers)': 163,
    'Transit Van (14 Passengers)': 213,
  },
  gstRate: 0.05,
  defaultStartTime: '22:00', // 10:00 PM
  defaultEndTime: '02:00',   // 2:00 AM
} as const;

// NEW: Ceremony Pick-Up - Min 3 hours, Min $650
export const ENGAGEMENT_SERVICE = {
  minPrice: 650,
  minHours: 3,
  hourlyRates: {
    'Luxury SUV (5 Passengers)': 163,
    'Transit Van (14 Passengers)': 213,
  },
  gstRate: 0.05,
} as const;

// NEW: Wedding Venue at Vista - Min 2 hours, Min $450
export const CEREMONY_HOTEL_VISTA = {
  minPrice: 450,
  minHours: 2,
  hourlyRates: {
    'Luxury SUV (5 Passengers)': 163,
    'Transit Van (14 Passengers)': 213,
  },
  gstRate: 0.05,
} as const;

export const ADD_ON_SERVICES = {
  CEREMONY_PICKUP_DROPOFF: {
    minCharge: 750,
    minHours: 1,
    maxHours: 3,
    description: 'Ceremony guest pickup & drop-off (1-3 hours before ceremony)',
  },
} as const;

// Map hotel names to their respective cities for route determination
export const HOTEL_CITY_MAP: Record<string, 'canmore' | 'banff'> = {
  // Canmore Hotels
  'solara': 'canmore',
  'super 8': 'canmore',
  'world mark': 'canmore',
  'worldmark canmore': 'canmore',
  'silvertip resort': 'canmore',
  'malcom hotel': 'canmore',
  'lodges of canmore': 'canmore',
  'wind tower': 'canmore',
  'northwinds': 'canmore',
  'blackstone mountain lodge': 'canmore',
  'rocky mountain ski lodge': 'canmore',
  'pocaterra inn & waterslide': 'canmore',
  'coast canmore hotel & conference centre': 'canmore',
  'chateau canmore': 'canmore',
  'falcon crest lodge': 'canmore',
  'grande rockies resort ‑ bellstar hotels & resorts': 'canmore',
  'stoneridge mountain resort': 'canmore',
  'silver creek lodge': 'canmore',
  'mystic springs chalets': 'canmore',
  'copperstone resort hotel': 'canmore',
  
  // Banff Hotels
  'banff boundary lodge': 'banff',
  'rundle chalet': 'banff',
  'skyridge 401': 'banff',
  'banff woods lodge': 'banff',
};

/**
 * Determine airport transfer route from pickup and drop locations
 */
export function determineRoute(pickup: string, drop: string): string | null {
  const pickupLower = pickup.toLowerCase().trim();
  const dropLower = drop.toLowerCase().trim();
  
  // Check for Calgary Airport (YYC) - including generic "airport"
  const isYYCPickup = pickupLower.includes('yyc') || 
                      pickupLower.includes('calgary airport') ||
                      pickupLower.includes('calgary international') ||
                      pickupLower === 'airport';
  
  const isYYCDrop = dropLower.includes('yyc') || 
                    dropLower.includes('calgary airport') ||
                    dropLower.includes('calgary international') ||
                    dropLower === 'airport';
  
  // Check if location is in Canmore (keyword match or hotel mapping)
  const isCanmorePickup = pickupLower.includes('canmore') || 
                         HOTEL_CITY_MAP[pickupLower] === 'canmore';
  const isCanmoreDrop = dropLower.includes('canmore') || 
                       HOTEL_CITY_MAP[dropLower] === 'canmore';
  
  // Check if location is in Banff (keyword match or hotel mapping)
  const isBanffPickup = pickupLower.includes('banff') || 
                       HOTEL_CITY_MAP[pickupLower] === 'banff';
  const isBanffDrop = dropLower.includes('banff') || 
                     HOTEL_CITY_MAP[dropLower] === 'banff';
  
  // Determine route
  if (isYYCPickup && isCanmoreDrop) return 'YYC-Canmore';
  if (isYYCPickup && isBanffDrop) return 'YYC-Banff';
  if (isCanmorePickup && isYYCDrop) return 'Canmore-YYC';
  if (isBanffPickup && isYYCDrop) return 'Banff-YYC';
  
  return null;
}

/**
 * Calculate airport transfer price
 */
export function calculateAirportTransferPrice(
  route: string | null,
  vehicle: string
): number {
  if (!route) return 0;
  
  const routePrices = AIRPORT_ROUTES[route as keyof typeof AIRPORT_ROUTES];
  if (!routePrices) return 0;
  
  return routePrices[vehicle as keyof typeof routePrices] || 0;
}

/**
 * Calculate wedding shuttle price with add-ons
 */
export function calculateWeddingPrice(
  vehicle: string,
  additionalHours: number,
  hasaddOns: string[]
): {
  basePrice: number;
  additionalHoursCost: number;
  ceremonyPickupCost: number;
  subtotal: number;
  gst: number;
  total: number;
  hourlyRate: number;
} {
  const basePrice = WEDDING_SHUTTLE.basePrice;
  const hourlyRate = WEDDING_SHUTTLE.hourlyRates[vehicle as keyof typeof WEDDING_SHUTTLE.hourlyRates] || 0;
  
  const additionalHoursCost = hourlyRate * (additionalHours || 0);
  
  const ceremonyPickupCost = hasaddOns.includes('CEREMONY_PICKUP_DROPOFF')
    ? ADD_ON_SERVICES.CEREMONY_PICKUP_DROPOFF.minCharge
    : 0;
  
  const subtotal = basePrice + additionalHoursCost + ceremonyPickupCost;
  const gst = subtotal * WEDDING_SHUTTLE.gstRate;
  const total = subtotal + gst;
  
  return {
    basePrice,
    additionalHoursCost,
    ceremonyPickupCost,
    subtotal,
    gst,
    total,
    hourlyRate,
  };
}

/**
 * Calculate engagement service price
 * Min 3 hours, Min $450
 */
export function calculateEngagementPrice(
  vehicle: string,
  hours: number
): {
  minPrice: number;
  hourlyRate: number;
  hoursBooked: number;
  subtotal: number;
  gst: number;
  total: number;
} {
  const minHours = ENGAGEMENT_SERVICE.minHours;
  const hoursBooked = Math.max(hours, minHours);
  const hourlyRate = ENGAGEMENT_SERVICE.hourlyRates[vehicle as keyof typeof ENGAGEMENT_SERVICE.hourlyRates] || 0;
  
  // Calculate based on hours
  let subtotal = hourlyRate * hoursBooked;
  
  // Ensure minimum price
  subtotal = Math.max(subtotal, ENGAGEMENT_SERVICE.minPrice);
  
  const gst = subtotal * ENGAGEMENT_SERVICE.gstRate;
  const total = subtotal + gst;
  
  return {
    minPrice: ENGAGEMENT_SERVICE.minPrice,
    hourlyRate,
    hoursBooked,
    subtotal,
    gst,
    total,
  };
}

/**
 * Calculate ceremony at Hotel Vista price
 * Min 2 hours, Min $350
 */
export function calculateCeremonyPrice(
  vehicle: string,
  hours: number
): {
  minPrice: number;
  hourlyRate: number;
  hoursBooked: number;
  subtotal: number;
  gst: number;
  total: number;
} {
  const minHours = CEREMONY_HOTEL_VISTA.minHours;
  const hoursBooked = Math.max(hours, minHours);
  const hourlyRate = CEREMONY_HOTEL_VISTA.hourlyRates[vehicle as keyof typeof CEREMONY_HOTEL_VISTA.hourlyRates] || 0;
  
  // Calculate based on hours
  let subtotal = hourlyRate * hoursBooked;
  
  // Ensure minimum price
  subtotal = Math.max(subtotal, CEREMONY_HOTEL_VISTA.minPrice);
  
  const gst = subtotal * CEREMONY_HOTEL_VISTA.gstRate;
  const total = subtotal + gst;
  
  return {
    minPrice: CEREMONY_HOTEL_VISTA.minPrice,
    hourlyRate,
    hoursBooked,
    subtotal,
    gst,
    total,
  };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Calculate deposit amount (35%)
 */
export function calculateDeposit(totalPrice: number): number {
  return totalPrice * 0.35;
}

// ==================== DYNAMIC DISTANCE-BASED PRICING ====================

/**
 * Distance-based pricing configuration
 * 
 * Tiered rates apply cumulatively (like tax brackets):
 * - First 50 km charged at $6.50/km
 * - Next 50 km (51-100) charged at $4.80/km
 * - Next 50 km (101-150) charged at $4.50/km
 * - Remaining km charged at $4.20/km
 */
export const DISTANCE_PRICING = {
  tiers: [
    { maxKm: 50, ratePerKm: 6.50 },
    { maxKm: 100, ratePerKm: 4.80 },
    { maxKm: 150, ratePerKm: 4.50 },
    { maxKm: Infinity, ratePerKm: 4.20 },
  ],
  vehicleMultipliers: {
    'Luxury SUV (5 Passengers)': 1.0,
    'Transit Van (14 Passengers)': 1.32,
  },
} as const;

export interface DistancePricingBreakdown {
  distanceKm: number;
  basePrice: number;
  vehicleMultiplier: number;
  finalPrice: number;
  tierBreakdown: Array<{
    fromKm: number;
    toKm: number;
    ratePerKm: number;
    distance: number;
    cost: number;
  }>;
}

/**
 * Calculate price based on distance using tiered cumulative rates
 * 
 * @param distanceKm - Total distance in kilometers
 * @param vehicle - Vehicle type
 * @returns Detailed price breakdown
 * 
 * @example
 * // 108 km trip in SUV
 * calculateDistanceBasedPrice(108, 'Luxury SUV (5 Passengers)')
 * // Returns:
 * // {
 * //   distanceKm: 108,
 * //   basePrice: 601,
 * //   vehicleMultiplier: 1.0,
 * //   finalPrice: 601,
 * //   tierBreakdown: [
 * //     { fromKm: 0, toKm: 50, ratePerKm: 6.50, distance: 50, cost: 325 },
 * //     { fromKm: 50, toKm: 100, ratePerKm: 4.80, distance: 50, cost: 240 },
 * //     { fromKm: 100, toKm: 108, ratePerKm: 4.50, distance: 8, cost: 36 }
 * //   ]
 * // }
 */
export function calculateDistanceBasedPrice(
  distanceKm: number,
  vehicle: string
): DistancePricingBreakdown {
  if (distanceKm <= 0) {
    throw new Error('Distance must be greater than 0');
  }
  
  if (distanceKm > 500) {
    throw new Error(`Distance ${distanceKm.toFixed(0)} km exceeds maximum allowed 500 km`);
  }
  
  const tierBreakdown: DistancePricingBreakdown['tierBreakdown'] = [];
  let remainingDistance = distanceKm;
  let basePrice = 0;
  let previousMax = 0;
  
  // Calculate price for each tier cumulatively
  for (const tier of DISTANCE_PRICING.tiers) {
    if (remainingDistance <= 0) break;
    
    const tierStartKm = previousMax;
    const tierMaxKm = tier.maxKm;
    const tierCapacity = tierMaxKm - tierStartKm;
    const distanceInThisTier = Math.min(remainingDistance, tierCapacity);
    const tierCost = distanceInThisTier * tier.ratePerKm;
    
    tierBreakdown.push({
      fromKm: tierStartKm,
      toKm: tierStartKm + distanceInThisTier,
      ratePerKm: tier.ratePerKm,
      distance: distanceInThisTier,
      cost: tierCost,
    });
    
    basePrice += tierCost;
    remainingDistance -= distanceInThisTier;
    previousMax = tierMaxKm;
  }
  
  // Apply vehicle multiplier
  const multiplier = DISTANCE_PRICING.vehicleMultipliers[
    vehicle as keyof typeof DISTANCE_PRICING.vehicleMultipliers
  ] || 1.0;
  
  const finalPrice = basePrice * multiplier;
  
  return {
    distanceKm,
    basePrice,
    vehicleMultiplier: multiplier,
    finalPrice,
    tierBreakdown,
  };
}

/**
 * Format distance pricing breakdown for display
 */
export function formatPricingBreakdown(breakdown: DistancePricingBreakdown): string {
  const lines = [
    `Distance: ${breakdown.distanceKm.toFixed(1)} km`,
    '',
    'Tier Breakdown:',
  ];
  
  breakdown.tierBreakdown.forEach((tier) => {
    lines.push(
      `  ${tier.fromKm}-${tier.toKm.toFixed(0)} km: ` +
      `${tier.distance.toFixed(1)} km × $${tier.ratePerKm.toFixed(2)}/km = ` +
      `$${tier.cost.toFixed(2)}`
    );
  });
  
  lines.push('');
  lines.push(`Base Price: $${breakdown.basePrice.toFixed(2)}`);
  lines.push(`Vehicle Multiplier: ${breakdown.vehicleMultiplier}x`);
  lines.push(`Final Price: $${breakdown.finalPrice.toFixed(2)}`);
  
  return lines.join('\n');
}
