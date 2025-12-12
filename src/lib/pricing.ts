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
