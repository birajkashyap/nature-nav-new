"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectPortal,
} from "@/components/ui/select";
import { WeddingBookingForm } from "@/components/wedding-booking-form";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

gsap.registerPlugin(ScrollTrigger);

// Initialize Stripe outside component to avoid recreation
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

// Vehicle fleet configuration
// Only Transit Van available for now (SUV coming soon)
const VEHICLE_FLEET = [
  { name: "Transit Van (14 Passengers)", minPassengers: 1, maxPassengers: 14 },
  // { name: "Luxury SUV (7 Passengers)", minPassengers: 1, maxPassengers: 7 }, // Coming Soon
];

function getRecommendedVehicle(passengers: number): string {
  const vehicle = VEHICLE_FLEET.find(
    (v) => passengers >= v.minPassengers && passengers <= v.maxPassengers
  );
  return vehicle?.name || VEHICLE_FLEET[VEHICLE_FLEET.length - 1].name;
}

function BookingForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const { isLoaded: mapsLoaded } = useGoogleMaps();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passengers, setPassengers] = useState<number>(1);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  
  // Location state
  const [pickup, setPickup] = useState("Calgary International Airport");
  const [pickupPlaceId, setPickupPlaceId] = useState("");
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  
  const [drop, setDrop] = useState("");
  const [dropPlaceId, setDropPlaceId] = useState("");
  const [dropLat, setDropLat] = useState<number | null>(null);
  const [dropLng, setDropLng] = useState<number | null>(null);
  
  const [luggageCount, setLuggageCount] = useState<number>(0);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!session) {
      router.push("/login?callbackUrl=/contact");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const car = selectedVehicle; // Use auto-selected vehicle
    const notes = formData.get("notes") as string;

    if (!date || !time) {
      setError("Please select both date and time.");
      setLoading(false);
      return;
    }

    // Combine date and time
    const bookingDate = new Date(`${date}T${time}`);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    if (bookingDate < oneHourFromNow) {
      setError("Bookings must be made at least 1 hour in advance.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create Booking & Get Price
      console.log('📍 Booking Submission - Location Data:', {
        pickup: {
          address: pickup,
          placeId: pickupPlaceId || 'MISSING',
          hasCoords: !!(pickupLat && pickupLng),
          coords: pickupLat && pickupLng ? `${pickupLat}, ${pickupLng}` : 'NULL'
        },
        drop: {
          address: drop,
          placeId: dropPlaceId || 'MISSING',
          hasCoords: !!(dropLat && dropLng),
          coords: dropLat && dropLng ? `${dropLat}, ${dropLng}` : 'NULL'
        },
        passengers,
        luggageCount
      });

      if (!pickupLat || !pickupLng || !dropLat || !dropLng) {
        console.warn('⚠️ WARNING: GPS coordinates missing! User may have typed manually without selecting from dropdown.');
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Legacy fields
          pickup,
          drop,
          // NEW: Structured location data
          pickupAddress: pickup,
          pickupPlaceId: pickupPlaceId || null,
          pickupLat,
          pickupLng,
          dropAddress: drop,
          dropPlaceId: dropPlaceId || null,
          dropLat,
          dropLng,
          date: bookingDate.toISOString(),
          car,
          notes,
          passengers, // Passenger count
          luggageCount, // NEW: Luggage count
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Booking failed");
      }

      const { booking, priceDetails } = data;

      // 2. Confirm Price with User (Simple Alert for MVP, better UI recommended)
      const confirmed = confirm(
        `Trip Details:\n` +
        `Distance: ~${priceDetails.distanceKm} km\n` +
        `Total Price: $${priceDetails.totalPrice}\n` +
        `Required Deposit (30%): $${priceDetails.depositAmount}\n\n` +
        `Proceed to payment?`
      );

      if (!confirmed) {
        // Ideally we should cancel the booking here if they say no,
        // but for now we just stop the payment flow. The booking stays "Pending"
        // and they can cancel it from profile or it expires.
        setLoading(false);
        return;
      }

      // 3. Initiate Payment (No amount passed, server uses DB)
      const paymentRes = await fetch("/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        throw new Error(paymentData.error || "Payment initialization failed");
      }

      if (paymentData.url) {
        window.location.href = paymentData.url;
      } else {
        throw new Error("Payment initialization failed: No URL provided.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pickup">Pickup Location</Label>
          {mapsLoaded ? (
            <PlacesAutocomplete
              value={pickup}
              onChange={setPickup}
              onPlaceSelect={(place) => {
                // Don't call setPickup here - it's already called by onChange in PlacesAutocomplete
                setPickupPlaceId(place.placeId);
                setPickupLat(place.lat);
                setPickupLng(place.lng);
              }}
              placeholder="Search for pickup location..."
              required
            />
          ) : (
            <Input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Loading location search..."
              required
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="drop">Drop-off Location</Label>
          {mapsLoaded ? (
            <PlacesAutocomplete
              value={drop}
              onChange={setDrop}
              onPlaceSelect={(place) => {
                // Don't call setDrop here - it's already called by onChange in PlacesAutocomplete
                setDropPlaceId(place.placeId);
                setDropLat(place.lat);
                setDropLng(place.lng);
              }}
              placeholder="Search for drop-off location..."
              required
            />
          ) : (
            <Input
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              placeholder="Loading location search..."
              required
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input id="time" name="time" type="time" required />
        </div>
      </div>

      {/* Passenger and Luggage Count */}
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
              onClick={() => {
                const newCount = Math.max(1, passengers - 1);
                setPassengers(newCount);
                setSelectedVehicle(getRecommendedVehicle(newCount));
              }}
              className="flex items-center justify-center w-12 h-10 hover:bg-muted transition-colors"
            >
              <span className="text-xl font-semibold">−</span>
            </button>
            <div className="flex-1 flex items-center justify-center h-10 text-center font-medium">
              {passengers}
            </div>
            <button
              type="button"
              onClick={() => {
                const newCount = Math.min(20, passengers + 1);
                setPassengers(newCount);
                setSelectedVehicle(getRecommendedVehicle(newCount));
              }}
              className="flex items-center justify-center w-12 h-10 hover:bg-muted transition-colors"
            >
              <span className="text-xl font-semibold">+</span>
            </button>
          </div>
          {selectedVehicle && (
            <p className="text-xs text-accent font-medium">
              ✓ Recommended: {selectedVehicle}
            </p>
          )}
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

      {/* Vehicle Selection - Auto-populated based on passengers */}
      <div className="space-y-2">
        <Label htmlFor="car">Selected Vehicle</Label>
        <Select
          name="car"
          required
          value={selectedVehicle}
          onValueChange={setSelectedVehicle}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select passenger count first" />
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
            {VEHICLE_FLEET.map((vehicle) => (
              <SelectItem key={vehicle.name} value={vehicle.name}>
                {vehicle.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Flight number, child seat request, etc."
        />
      </div>

      {/* Terms & Conditions Agreement */}
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
          , including the cancellation policy and deposit requirements.
        </label>
      </div>

      <Button
        type="submit"
        disabled={loading || !agreedToTerms}
        size="lg"
        className="w-full h-12 rounded-full bg-accent text-accent-foreground font-semibold shadow-lg transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Proceed to Payment (30% Deposit)"}
      </Button>

      {!session && (
        <p className="text-xs text-center text-muted-foreground">
          You will be asked to sign in before booking.
        </p>
      )}
    </form>
  );
}

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "info@naturenavigator.ca",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "107 Armstrong Place, Canmore, Alberta",
  },
  {
    icon: Clock,
    title: "Hours",
    value: "24/7 Availability",
  },
];

const faqData = [
  {
    value: "item-1",
    question: "How far in advance should I book?",
    answer:
      "We recommend booking at least 48 hours in advance, especially during peak season (June-September) and for holidays. For last-minute requests, please call us directly.",
  },
  {
    value: "item-2",
    question: "What's included in the service?",
    answer:
      "All our services include a professional, vetted chauffeur, a meticulously cleaned premium vehicle, complimentary bottled water, and fuel. Airport transfers also include flight tracking and complimentary wait time.",
  },
  {
    value: "item-3",
    question: "What is your cancellation policy?",
    answer:
      "We offer free cancellation up to 24 hours before your scheduled pickup time. Cancellations within 24 hours may be subject to a fee. Please refer to your booking confirmation for full details.",
  },
  {
    value: "item-4",
    question: "Do you provide child seats?",
    answer:
      "Yes, we can provide complimentary child seats (infant, toddler, and booster) upon request. Please specify your needs when making your reservation.",
  },
];

interface GSAPAccordionContentProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
  children: React.ReactNode;
}

const GSAPAccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  GSAPAccordionContentProps
>(({ children, className, ...props }, ref) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    const inner = innerRef.current;

    if (!content || !inner) return;

    const isOpen = content.getAttribute("data-state") === "open";

    if (isOpen) {
      gsap.set(inner, { height: "auto" });
      const finalHeight = inner.offsetHeight;

      gsap.fromTo(
        inner,
        { height: 0, opacity: 0 },
        {
          height: finalHeight,
          opacity: 1,
          duration: 0.4,
          ease: "power3.out",
          onComplete: () => {
            if (inner) gsap.set(inner, { height: "auto" });
          },
        }
      );
    } else {
      gsap.to(inner, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [props]);

  return (
    <AccordionPrimitive.Content
      ref={(node) => {
        contentRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={`overflow-hidden ${className || ""}`}
      {...props}
    >
      <div ref={innerRef} className="pb-4">
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
});

GSAPAccordionContent.displayName = "GSAPAccordionContent";

const ContactPage = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const [bookingType, setBookingType] = useState<'airport' | 'wedding'>('airport');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-animate",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: mainRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, mainRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <main
      ref={mainRef}
      className="min-h-screen pt-32 pb-24 px-4 font-body"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
        {/* Left: Contact Info */}
        <div className="space-y-8">
          <div className="contact-animate">
            <h1 className="font-luxury text-5xl md:text-6xl mb-4 text-foreground/95">
              Reserve Your Ride
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Experience premium shuttle services with Nature Navigator. Book your luxury transportation 
              across the Canadian Rockies today.
            </p>
          </div>

          {/* Service Type Selector - NEW */}
          <div className="space-y-4 contact-animate">
            <Label htmlFor="serviceType" className="text-lg font-semibold text-accent">
              Select Service Type
            </Label>
            <Select 
              value={bookingType} 
              onValueChange={(value: 'airport' | 'wedding') => setBookingType(value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
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
                <SelectItem value="airport">
                  <div className="flex flex-col">
                    <span className="font-semibold">Airport Transfer</span>
                    <span className="text-xs text-muted-foreground">YYC → Canmore/Banff | Canmore/Banff → YYC</span>
                  </div>
                </SelectItem>
                <SelectItem value="wedding">
                  <div className="flex flex-col">
                    <span className="font-semibold">Wedding Shuttle Service</span>
                    <span className="text-xs text-muted-foreground">4-hour service from $850</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Form Rendering */}
          <div className="space-y-6 contact-animate">
            <h2 className="text-4xl font-luxury text-accent">
              {bookingType === 'airport' ? 'Airport Transfer Details' : 'Wedding Shuttle Booking'}
            </h2>
            
            {bookingType === 'airport' ? (
              <BookingForm />
            ) : (
              <WeddingBookingForm />
            )}
          </div>

          <div className="space-y-8 contact-animate">
            <div className="grid grid-cols-2 gap-6">
              {contactInfo.map((item) => (
                <Card
                  key={item.title}
                  className="bg-card p-6 rounded-xl shadow-lg border-0"
                >
                  <item.icon className="h-8 w-8 text-accent mb-3" />
                  <h3 className="text-xl font-luxury text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {item.value}
                  </p>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/30 dark:bg-muted/50 h-80 rounded-xl shadow-lg border-0 flex flex-col items-center justify-center text-center p-6">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-2xl font-luxury text-foreground/80">
                Our Location
              </h3>
              <p className="text-base text-muted-foreground">
                Google Maps Integration
              </p>
            </Card>
          </div>
        </div>

        {/* Right: FAQ */}
        <section className="pt-16 contact-animate">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-luxury text-foreground/95">
              Frequently Asked Questions
            </h2>
          </div>
          <Accordion
            type="single"
            collapsible
            className="w-full max-w-3xl mx-auto"
          >
            {faqData.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger className="text-lg font-semibold text-left py-4 text-foreground/90 hover:text-accent">
                  {item.question}
                </AccordionTrigger>
                <GSAPAccordionContent className="text-base text-muted-foreground">
                  {item.answer}
                </GSAPAccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </main>
  );
};

export default ContactPage;
