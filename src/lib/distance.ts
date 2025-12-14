/**
 * Distance calculation utilities for dynamic pricing
 * 
 * Two calculation methods:
 * 1. Haversine: Fast, client-side estimates (straight-line distance × road multiplier)
 * 2. Distance Matrix API: Accurate, server-side driving distances with caching
 */

// ==================== TYPES ====================

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DistanceResult {
  distanceKm: number;
  durationSeconds: number;
  method: 'HAVERSINE' | 'DISTANCE_MATRIX';
}

export interface DistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      distance: { value: number }; // meters
      duration: { value: number }; // seconds
      status: string;
    }>;
  }>;
  status: string;
}

// ==================== CONSTANTS ====================

const EARTH_RADIUS_KM = 6371;
const ROAD_MULTIPLIER = 1.25; // Haversine × 1.25 ≈ actual road distance
const MAX_DISTANCE_KM = 500; // Safety limit (e.g., max YYC to Jasper)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ==================== IN-MEMORY CACHE ====================

interface CacheEntry {
  result: DistanceResult;
  timestamp: number;
}

const distanceCache = new Map<string, CacheEntry>();

/**
 * Generate cache key from coordinates (rounded to 3 decimals = ~100m precision)
 */
function getCacheKey(from: Coordinates, to: Coordinates): string {
  return `${from.lat.toFixed(3)}_${from.lng.toFixed(3)}_${to.lat.toFixed(3)}_${to.lng.toFixed(3)}`;
}

/**
 * Get cached distance result if available and not expired
 */
function getCachedDistance(from: Coordinates, to: Coordinates): DistanceResult | null {
  const key = getCacheKey(from, to);
  const cached = distanceCache.get(key);
  
  if (!cached) return null;
  
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_TTL_MS) {
    distanceCache.delete(key);
    return null;
  }
  
  return cached.result;
}

/**
 * Cache distance result
 */
function cacheDistance(from: Coordinates, to: Coordinates, result: DistanceResult): void {
  const key = getCacheKey(from, to);
  distanceCache.set(key, {
    result,
    timestamp: Date.now(),
  });
}

// ==================== HAVERSINE FORMULA ====================

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate straight-line distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 * 
 * Use case: Frontend instant estimates
 * 
 * @param from - Origin coordinates
 * @param to - Destination coordinates
 * @returns Distance in kilometers (straight-line)
 */
export function calculateHaversineDistance(from: Coordinates, to: Coordinates): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) *
    Math.cos(toRadians(to.lat)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;
  
  return distance;
}

/**
 * Calculate estimated road distance using Haversine + road multiplier
 * 
 * Use case: Frontend price estimates before booking submission
 * 
 * @param from - Origin coordinates
 * @param to - Destination coordinates
 * @returns Estimated road distance in kilometers
 */
export function estimateRoadDistance(from: Coordinates, to: Coordinates): number {
  const straightLine = calculateHaversineDistance(from, to);
  return straightLine * ROAD_MULTIPLIER;
}

// ==================== GOOGLE DISTANCE MATRIX API ====================

/**
 * Fetch actual driving distance from Google Distance Matrix API
 * 
 * Use case: Backend final price calculation
 * 
 * API Cost: $0.005 per request (Basic tier)
 * Free tier: $200/month = 40,000 requests
 * 
 * @param from - Origin coordinates
 * @param to - Destination coordinates
 * @returns Distance in km and duration in seconds
 * @throws Error if API call fails or distance exceeds safety limit
 */
export async function getActualDistance(
  from: Coordinates,
  to: Coordinates
): Promise<DistanceResult> {
  // Validate coordinates
  if (!isValidCoordinates(from) || !isValidCoordinates(to)) {
    throw new Error('Invalid coordinates provided');
  }
  
  // Check cache first
  const cached = getCachedDistance(from, to);
  if (cached) {
    console.log('✅ Distance cache hit');
    return cached;
  }
  
  console.log('🔄 Fetching distance from Google Distance Matrix API...');
  
  const apiKey = process.env.GOOGLE_DISTANCE_MATRIX_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_DISTANCE_MATRIX_API_KEY not configured');
  }
  
  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
  url.searchParams.set('origins', `${from.lat},${from.lng}`);
  url.searchParams.set('destinations', `${to.lat},${to.lng}`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('units', 'metric');
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`Distance Matrix API error: ${response.status}`);
    }
    
    const data: DistanceMatrixResponse = await response.json();
    
    // Check API response status
    if (data.status !== 'OK') {
      throw new Error(`Distance Matrix API status: ${data.status}`);
    }
    
    const element = data.rows[0]?.elements[0];
    if (!element || element.status !== 'OK') {
      throw new Error(`No route found between locations. Status: ${element?.status}`);
    }
    
    const distanceMeters = element.distance.value;
    const distanceKm = distanceMeters / 1000;
    
    // Safety check: prevent extremely long distances
    if (distanceKm > MAX_DISTANCE_KM) {
      throw new Error(
        `Distance ${distanceKm.toFixed(0)} km exceeds maximum allowed ${MAX_DISTANCE_KM} km`
      );
    }
    
    const result: DistanceResult = {
      distanceKm,
      durationSeconds: element.duration.value,
      method: 'DISTANCE_MATRIX',
    };
    
    // Cache the result
    cacheDistance(from, to, result);
    
    console.log(`✅ Distance Matrix: ${distanceKm.toFixed(1)} km, ${(element.duration.value / 60).toFixed(0)} min`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Distance Matrix API error:', error);
    throw error;
  }
}

// ==================== VALIDATION ====================

/**
 * Validate GPS coordinates
 */
export function isValidCoordinates(coords: Coordinates): boolean {
  return (
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    coords.lat >= -90 &&
    coords.lat <= 90 &&
    coords.lng >= -180 &&
    coords.lng <= 180 &&
    !isNaN(coords.lat) &&
    !isNaN(coords.lng)
  );
}

/**
 * Validate distance is within reasonable bounds
 */
export function isValidDistance(distanceKm: number): boolean {
  return distanceKm > 0 && distanceKm <= MAX_DISTANCE_KM;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Clear expired cache entries (for periodic cleanup)
 */
export function clearExpiredCache(): number {
  const now = Date.now();
  let cleared = 0;
  
  for (const [key, entry] of distanceCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      distanceCache.delete(key);
      cleared++;
    }
  }
  
  if (cleared > 0) {
    console.log(`🧹 Cleared ${cleared} expired cache entries`);
  }
  
  return cleared;
}

/**
 * Get cache statistics (for monitoring)
 */
export function getCacheStats() {
  return {
    size: distanceCache.size,
    maxAge: CACHE_TTL_MS,
  };
}
