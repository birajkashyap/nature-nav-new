"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/select";

gsap.registerPlugin(ScrollTrigger);

// Initialize Stripe outside component to avoid recreation
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function BookingForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    const pickup = formData.get("pickup") as string;
    const drop = formData.get("drop") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const car = formData.get("car") as string;
    const notes = formData.get("notes") as string;

    if (!date || !time) {
      setError("Please select both date and time.");
      setLoading(false);
      return;
    }

    // Combine date and time
    const bookingDate = new Date(`${date}T${time}`);

    try {
      // 1. Create Booking & Get Price
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup,
          drop,
          date: bookingDate.toISOString(), // Ensure date is sent as ISO string
          car,
          notes,
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
        `Required Deposit (50%): $${priceDetails.depositAmount}\n\n` +
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pickup">Pickup Location</Label>
          <Input id="pickup" name="pickup" required placeholder="YYC Airport" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="drop">Drop-off Location</Label>
          <Input id="drop" name="drop" required placeholder="Banff Springs Hotel" />
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

      <div className="space-y-2">
        <Label htmlFor="car">Select Vehicle</Label>
        <Select name="car" required>
          <SelectTrigger>
            <SelectValue placeholder="Choose a vehicle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Executive Sedan">Executive Sedan (1-3 Pax)</SelectItem>
            <SelectItem value="Luxury SUV">Luxury SUV (1-6 Pax)</SelectItem>
            <SelectItem value="Executive Van">Executive Van (6-10 Pax)</SelectItem>
            <SelectItem value="Stretch Limousine">Stretch Limousine (8-12 Pax)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Flight number, child seat request, etc."
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="w-full h-12 rounded-full bg-accent text-accent-foreground font-semibold shadow-lg transition-all hover:opacity-90 hover:scale-[1.01]"
      >
        {loading ? "Processing..." : "Proceed to Payment (50% Deposit)"}
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
    icon: Phone,
    title: "Phone",
    value: "+1 (555) 123-4567",
  },
  {
    icon: Mail,
    title: "Email",
    value: "reservations@naturenavigator.com",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "105 Bow Meadows Crescent, Canmore, AB",
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
      <div className="max-w-7xl mx-auto space-y-20">
        <header className="text-center contact-animate">
          <h1 className="text-6xl md:text-7xl font-luxury mb-4 text-foreground/95">
            Contact & Book
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Reserve your luxury ride or get in touch with our team. We are
            available 24/7 to coordinate your travel.
          </p>
        </header>

        <section className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6 contact-animate">
            <h2 className="text-4xl font-luxury text-accent">
              Reserve Your Ride
            </h2>
            <BookingForm />
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
        </section>

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
