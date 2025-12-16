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
import { calculateEngagementPrice, ENGAGEMENT_SERVICE } from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

const VEHICLE_OPTIONS = [
  // { name: "Luxury SUV (7 Passengers)", minPassengers: 1, maxPassengers: 7 }, // Coming Soon
  { name: "Transit Van (14 Passengers)", minPassengers: 1, maxPassengers: 14 },
];

export function EngagementBookingForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const { isLoaded: mapsLoaded } = useGoogleMaps();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form state
  const [eventDate, setEventDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("14:00"); // 2:00 PM
  const [eventEndTime, setEventEndTime] = useState("17:00");     // 5:00 PM
  const [venueAddress, setVenueAddress] = useState("");
  
  // Google Places data for venue
  const [venuePlaceId, setVenuePlaceId] = useState("");
  const [venueLat, setVenueLat] = useState<number | null>(null);
  const [venueLng, setVenueLng] = useState<number | null>(null);
  
  const [guestCount, setGuestCount] = useState(1);
  const [luggageCount, setLuggageCount] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [hours, setHours] = useState(3); // Min 3 hours
  const [notes, setNotes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  // Auto-select vehicle based on guest count
  useEffect(() => {
    if (guestCount <= 7) {
      setSelectedVehicle("Luxury SUV (7 Passengers)");
    } else {
      setSelectedVehicle("Transit Van (14 Passengers)");
    }
  }, [guestCount]);

  // Calculate pricing
  const pricing = selectedVehicle
    ? calculateEngagementPrice(selectedVehicle, hours)
    : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!session) {
      router.push("/login?callbackUrl=/contact");
      setLoading(false);
      return;
    }

    if (!eventDate || !eventStartTime) {
      setError("Please fill in all required event details");
      setLoading(false);
      return;
    }

    try {
      const bookingDate = new Date(`${eventDate}T${eventStartTime}`);
      let eventEnd = new Date(`${eventDate}T${eventEndTime}`);
      
      if (eventEnd <= bookingDate) {
        eventEnd = new Date(eventEnd.getTime() + 24 * 60 * 60 * 1000);
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingType: "ENGAGEMENT",
          pickup: venueAddress,
          drop: venueAddress,
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
          passengers: guestCount,
          eventStartTime: bookingDate.toISOString(),
          eventEndTime: eventEnd.toISOString(),
          additionalHours: hours - ENGAGEMENT_SERVICE.minHours,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Booking failed");
      }

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
        <h3 className="text-lg font-semibold text-accent">Engagement Details</h3>
        
        <div className="space-y-2">
          <Label htmlFor="eventDate">Event Date *</Label>
          <Input
            id="eventDate"
            type="date"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time *</Label>
            <Input
              id="startTime"
              type="time"
              required
              value={eventStartTime}
              onChange={(e) => setEventStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time *</Label>
            <Input
              id="endTime"
              type="time"
              required
              value={eventEndTime}
              onChange={(e) => setEventEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue">Venue Address *</Label>
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
              placeholder="Enter venue address"
              required
            />
          ) : (
            <Input
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="Enter venue address"
              required
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
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                className="flex items-center justify-center w-12 h-10 hover:bg-muted transition-colors"
              >
                <span className="text-xl font-semibold">−</span>
              </button>
              <div className="flex-1 flex items-center justify-center h-10 text-center font-medium">
                {guestCount}
              </div>
              <button
                type="button"
                onClick={() => setGuestCount(Math.min(14, guestCount + 1))}
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
          <Label>Vehicle (Auto-selected based on guests)</Label>
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
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

      {/* Duration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-accent">Duration</h3>
        <div className="space-y-2">
          <Label>Service Hours (Minimum 3 hours)</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setHours(Math.max(ENGAGEMENT_SERVICE.minHours, hours - 1))}
            >
              -
            </Button>
            <span className="text-2xl font-bold w-12 text-center">{hours}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setHours(hours + 1)}
            >
              +
            </Button>
            <span className="text-sm text-muted-foreground">hours</span>
          </div>
        </div>
      </div>

      {/* Notes */}
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
              <span>Service Hours</span>
              <span>{pricing.hoursBooked} hours</span>
            </div>
            <div className="flex justify-between">
              <span>Rate: ${pricing.hourlyRate}/hour</span>
              <span></span>
            </div>
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
              <span>Deposit (30%)</span>
              <span>${(pricing.total * 0.3).toFixed(2)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Terms & Conditions */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border">
        <input
          type="checkbox"
          id="terms-agreement"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-border accent-accent cursor-pointer"
        />
        <label htmlFor="terms-agreement" className="text-sm text-foreground/80 cursor-pointer">
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
        disabled={loading || !agreedToTerms}
        size="lg"
        className="w-full h-12 rounded-full bg-accent text-accent-foreground font-semibold shadow-lg transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : `Proceed to Payment (30% Deposit)`}
      </Button>

      {!session && (
        <p className="text-xs text-center text-muted-foreground">
          You will be asked to sign in before booking.
        </p>
      )}
    </form>
  );
}
