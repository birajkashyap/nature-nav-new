"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateWeddingPrice, WEDDING_SHUTTLE } from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

const VEHICLE_OPTIONS = [
  // { name: "Luxury SUV (5 Passengers)", minPassengers: 1, maxPassengers: 7 }, // Coming Soon
  { name: "Transit Van (14 Passengers)", minPassengers: 1, maxPassengers: 14 },
];

export function WeddingBookingForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const { isLoaded: mapsLoaded } = useGoogleMaps();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form state
  const [eventDate, setEventDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("22:00"); // 10:00 PM
  const [eventEndTime, setEventEndTime] = useState("02:00");     // 2:00 AM
  const [venueAddress, setVenueAddress] = useState("");
  
  // NEW: Google Places data for venue
  const [venuePlaceId, setVenuePlaceId] = useState("");
  const [venueLat, setVenueLat] = useState<number | null>(null);
  const [venueLng, setVenueLng] = useState<number | null>(null);
  
  const [guestCount, setGuestCount] = useState(1);
  const [luggageCount, setLuggageCount] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [additionalHours, setAdditionalHours] = useState(0);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [ceremonyTime, setCeremonyTime] = useState("");
  const [pickupLocations, setPickupLocations] = useState("");
  const [notes, setNotes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  // Auto-select vehicle based on guest count
  function handleGuestCountChange(count: number) {
    setGuestCount(count);
    const recommended = VEHICLE_OPTIONS.find(
      (v) => count >= v.minPassengers && count <= v.maxPassengers
    );
    if (recommended) {
      setSelectedVehicle(recommended.name);
    }
  }

  // Toggle add-on
  function toggleAddOn(addOn: string) {
    setAddOns((prev) =>
      prev.includes(addOn) ? prev.filter((a) => a !== addOn) : [...prev, addOn]
    );
  }

  // Calculate pricing
  const pricing = selectedVehicle
    ? calculateWeddingPrice(selectedVehicle, additionalHours, addOns)
    : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check if user is logged in
    if (!session) {
      router.push("/login?callbackUrl=/contact");
      setLoading(false);
      return;
    }

    if (!eventDate || !eventStartTime || !eventEndTime) {
      setError("Please fill in all required event details");
      setLoading(false);
      return;
    }

    try {
      // Create booking date from event date and start time
      const bookingDate = new Date(`${eventDate}T${eventStartTime}`);
      let eventEnd = new Date(`${eventDate}T${eventEndTime}`);
      
      // If end time is earlier than start time, the event crosses midnight
      // Add one day to the end date
      if (eventEnd <= bookingDate) {
        eventEnd = new Date(eventEnd.getTime() + 24 * 60 * 60 * 1000);
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingType: "WEDDING_SHUTTLE",
          // Legacy fields (backward compatibility)
          pickup: venueAddress,
          drop: venueAddress,
          // NEW: Structured location data
          pickupAddress: venueAddress,
          pickupPlaceId: venuePlaceId || null,
          pickupLat: venueLat,
          pickupLng: venueLng,
          dropAddress: venueAddress,
          dropPlaceId: venuePlaceId || null,
          dropLat: venueLat,
          dropLng: venueLng,
          date: bookingDate.toISOString(),
          car: selectedVehicle,
          notes,
          eventStartTime: bookingDate.toISOString(),
          eventEndTime: eventEnd.toISOString(),
          additionalHours,
          addOns: addOns.map((addOnType) => ({
            addOnType,
            serviceName: addOnType === "CEREMONY_PICKUP_DROPOFF" ? "Ceremony Guest Pickup/Drop-off" : addOnType,
            price: addOnType === "CEREMONY_PICKUP_DROPOFF" ? 750 : 0,
            duration: addOnType === "CEREMONY_PICKUP_DROPOFF" ? 3 : null,
            pickupLocation: pickupLocations || null,
            notes: ceremonyTime ? `Ceremony time: ${ceremonyTime}` : null,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Booking failed");
      }

      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Event Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-accent">Event Details</h3>
        
        <div className="space-y-2">
          <Label htmlFor="eventDate">Event Date *</Label>
          <Input
            id="eventDate"
            type="date"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventStartTime">Start Time (Default: 10:00 PM) *</Label>
            <Input
              id="eventStartTime"
              type="time"
              required
              value={eventStartTime}
              onChange={(e) => setEventStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventEndTime">End Time (Default: 2:00 AM) *</Label>
            <Input
              id="eventEndTime"
              type="time"
              required
              value={eventEndTime}
              onChange={(e) => setEventEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="venueAddress">Venue Address *</Label>
          {mapsLoaded ? (
            <PlacesAutocomplete
              value={venueAddress}
              onChange={setVenueAddress}
              onPlaceSelect={(place) => {
                setVenueAddress(place.address);
                setVenuePlaceId(place.placeId);
                setVenueLat(place.lat);
                setVenueLng(place.lng);
              }}
              placeholder="Search for wedding venue..."
              required
            />
          ) : (
            <Input
              id="venueAddress"
              required
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="Loading location search..."
            />
          )}
        </div>
      </div>

      {/* Passenger and Luggage Count */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-accent">Guest & Vehicle</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Passenger Count */}
          <div className="space-y-2">
            <Label>Number of Passengers *</Label>
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <div className="flex items-center justify-center w-12 h-10 bg-muted">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => handleGuestCountChange(Math.max(1, guestCount - 1))}
                className="flex items-center justify-center w-12 h-10 hover:bg-muted transition-colors"
              >
                <span className="text-xl font-semibold">−</span>
              </button>
              <div className="flex-1 flex items-center justify-center h-10 text-center font-medium">
                {guestCount}
              </div>
              <button
                type="button"
                onClick={() => handleGuestCountChange(Math.min(20, guestCount + 1))}
                className="flex items-center justify-center w-12 h-10 hover:bg-muted transition-colors"
              >
                <span className="text-xl font-semibold">+</span>
              </button>
            </div>
          </div>

          {/* Luggage Count */}
          <div className="space-y-2">
            <Label>Luggage Count</Label>
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <div className="flex items-center justify-center w-12 h-10 bg-muted">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setLuggageCount(Math.max(0, luggageCount - 1))}
                className="flex items-center justify-center w-12 h-10 hover:bg-muted transition-colors"
              >
                <span className="text-xl font-semibold">−</span>
              </button>
              <div className="flex-1 flex items-center justify-center h-10 text-center font-medium">
                {luggageCount}
              </div>
              <button
                type="button"
                onClick={() => setLuggageCount(Math.min(20, luggageCount + 1))}
                className="flex items-center justify-center w-12 h-10 hover:bg-muted transition-colors"
              >
                <span className="text-xl font-semibold">+</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle">Selected Vehicle *</Label>
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle} required>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              sideOffset={4}
              className="z-[9999] !bg-background border-2 border-border shadow-2xl !opacity-100"
              style={{
                backgroundColor: 'var(--background)',
                opacity: 1,
                zIndex: 9999,
              }}
            >
              {VEHICLE_OPTIONS.map((vehicle) => (
                <SelectItem key={vehicle.name} value={vehicle.name}>
                  {vehicle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Service Duration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-accent">Service Duration</h3>
        <p className="text-sm text-muted-foreground">
          Base service includes 4 hours. Add extended hours if needed.
        </p>
        
        <div className="space-y-2">
          <Label htmlFor="additionalHours">Additional Hours (0-4)</Label>
          <Input
            id="additionalHours"
            type="number"
            min="0"
            max="4"
            value={additionalHours}
            onChange={(e) => setAdditionalHours(parseInt(e.target.value) || 0)}
          />
          {selectedVehicle && additionalHours > 0 && (
            <p className="text-xs text-muted-foreground">
              Rate: ${WEDDING_SHUTTLE.hourlyRates[selectedVehicle as keyof typeof WEDDING_SHUTTLE.hourlyRates]}/hour
            </p>
          )}
        </div>
      </div>

      {/* Add-On Services */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-accent">Add-On Services</h3>
        
        <div className="flex items-start space-x-3">
          <Checkbox
            id="ceremonyPickup"
            checked={addOns.includes("CEREMONY_PICKUP_DROPOFF")}
            onCheckedChange={() => toggleAddOn("CEREMONY_PICKUP_DROPOFF")}
          />
          <div className="space-y-1">
            <Label htmlFor="ceremonyPickup" className="cursor-pointer">
              Ceremony Guest Pickup/Drop-off ($750)
            </Label>
            <p className="text-xs text-muted-foreground">
              1-3 hours before ceremony - transfers from hotels/Airbnbs to venue
            </p>
          </div>
        </div>

        {addOns.includes("CEREMONY_PICKUP_DROPOFF") && (
          <div className="ml-8 space-y-4 border-l-2 border-accent/20 pl-4">
            <div className="space-y-2">
              <Label htmlFor="ceremonyTime">Ceremony Time</Label>
              <Input
                id="ceremonyTime"
                type="time"
                value={ceremonyTime}
                onChange={(e) => setCeremonyTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupLocations">Pickup Locations</Label>
              <Textarea
                id="pickupLocations"
                value={pickupLocations}
                onChange={(e) => setPickupLocations(e.target.value)}
                placeholder="List hotels/Airbnbs for guest pickup..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requests or information..."
        />
      </div>

      {/* Price Summary */}
      {pricing && (
        <Card className="p-6 bg-accent/5 border-accent/20">
          <h3 className="text-lg font-semibold mb-4">Price Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Base Wedding Shuttle (4 hours)</span>
              <span>${pricing.basePrice.toFixed(2)}</span>
            </div>
            {additionalHours > 0 && (
              <div className="flex justify-between">
                <span>Additional {additionalHours} hour(s) @ ${pricing.hourlyRate}/hr</span>
                <span>${pricing.additionalHoursCost.toFixed(2)}</span>
              </div>
            )}
            {pricing.ceremonyPickupCost > 0 && (
              <div className="flex justify-between">
                <span>Ceremony Pickup/Drop-off</span>
                <span>${pricing.ceremonyPickupCost.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-accent/20 pt-2 mt-2"></div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${pricing.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span>${pricing.gst.toFixed(2)}</span>
            </div>
            <div className="border-t border-accent/20 pt-2 mt-2"></div>
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>${pricing.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-accent font-semibold">
              <span>Deposit (35%)</span>
              <span>${(pricing.total * 0.35).toFixed(2)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Terms & Conditions Agreement */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border">
        <input
          type="checkbox"
          id="wedding-terms-agreement"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-border accent-accent cursor-pointer"
        />
        <label htmlFor="wedding-terms-agreement" className="text-sm text-foreground/80 cursor-pointer">
          I have read and agree to the{" "}
          <Link 
            href="/terms" 
            target="_blank" 
            className="text-accent hover:underline font-medium"
          >
            Terms & Conditions
          </Link>
          , including the 35% non-refundable deposit and cancellation policy.
        </label>
      </div>

      <Button
        type="submit"
        disabled={loading || !selectedVehicle || !agreedToTerms}
        size="lg"
        className="w-full h-12 rounded-full bg-accent text-accent-foreground font-semibold shadow-lg transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : `Proceed to Payment (35% Deposit)`}
      </Button>
    </form>
  );
}
