"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  { name: "Luxury SUV (7 Passengers)", minPassengers: 1, maxPassengers: 7 },
  { name: "Transit Van (14 Passengers)", minPassengers: 8, maxPassengers: 14 },
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
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [additionalHours, setAdditionalHours] = useState(0);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [ceremonyTime, setCeremonyTime] = useState("");
  const [pickupLocations, setPickupLocations] = useState("");
  const [notes, setNotes] = useState("");

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

      {/* Guest Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-accent">Guest Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="guestCount">Number of Guests *</Label>
          <Input
            id="guestCount"
            type="number"
            min="1"
            max="20"
            required
            value={guestCount}
            onChange={(e) => handleGuestCountChange(parseInt(e.target.value) || 1)}
          />
          {selectedVehicle && (
            <p className="text-xs text-accent">✓ Recommended: {selectedVehicle}</p>
          )}
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
              <span>Deposit (50%)</span>
              <span>${(pricing.total * 0.5).toFixed(2)}</span>
            </div>
          </div>
        </Card>
      )}

      <Button
        type="submit"
        disabled={loading || !selectedVehicle}
        size="lg"
        className="w-full h-12 rounded-full bg-accent text-accent-foreground font-semibold shadow-lg transition-all hover:opacity-90 hover:scale-[1.01]"
      >
        {loading ? "Processing..." : `Proceed to Payment (50% Deposit)`}
      </Button>
    </form>
  );
}
