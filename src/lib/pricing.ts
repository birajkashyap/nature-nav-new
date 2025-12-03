// Pricing configuration and calculation helpers for Nature Navigator

export const AIRPORT_ROUTES = {
  'YYC-Canmore': {
    'Luxury SUV (7 Passengers)': 518.44,
    'Transit Van (14 Passengers)': 685.13,
  },
  'YYC-Banff': {
    'Luxury SUV (7 Passengers)': 681.45,
    'Transit Van (14 Passengers)': 897,
  },
  'Canmore-YYC': {
    'Luxury SUV (7 Passengers)': 518.44,
    'Transit Van (14 Passengers)': 685.13,
  },
  'Banff-YYC': {
    'Luxury SUV (7 Passengers)': 681.45,
    'Transit Van (14 Passengers)': 897,
  },
} as const;

export const WEDDING_SHUTTLE = {
  basePrice: 850,
  baseHours: 4,
  hourlyRates: {
    'Luxury SUV (7 Passengers)': 163,
    'Transit Van (14 Passengers)': 213,
  },
  gstRate: 0.05,
  defaultStartTime: '22:00', // 10:00 PM
  defaultEndTime: '02:00',   // 2:00 AM
} as const;

export const ADD_ON_SERVICES = {
  CEREMONY_PICKUP_DROPOFF: {
    minCharge: 750,
    minHours: 1,
    maxHours: 3,
    description: 'Ceremony guest pickup & drop-off (1-3 hours before ceremony)',
  },
} as const;

/**
 * Determine airport transfer route from pickup and drop locations
 */
export function determineRoute(pickup: string, drop: string): string | null {
  const pickupLower = pickup.toLowerCase();
  const dropLower = drop.toLowerCase();
  
  // Check for Calgary Airport (YYC)
  const isYYCPickup = pickupLower.includes('yyc') || pickupLower.includes('calgary airport');
  const isYYCDrop = dropLower.includes('yyc') || dropLower.includes('calgary airport');
  
  // Check for Canmore
  const isCanmorePickup = pickupLower.includes('canmore');
  const isCanmoreDrop = dropLower.includes('canmore');
  
  // Check for Banff
  const isBanffPickup = pickupLower.includes('banff');
  const isBanffDrop = dropLower.includes('banff');
  
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
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Calculate deposit amount (50%)
 */
export function calculateDeposit(totalPrice: number): number {
  return totalPrice * 0.5;
}
