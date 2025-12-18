"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Briefcase, DollarSign, BaggageClaim } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const fleetData = [
  {
    name: "Luxury SUV",
    image: "/suv.jpg",
    capacity: "Up to 5 passengers",
    luggage: "4-6 bags",
    features: [
      "Premium leather interior",
      "Spacious & comfortable",
      "Entertainment system",
      "Climate control",
    ],
    description: "Perfect for families, small groups, and airport transfers.",
    comingSoon: true, // SUV temporarily unavailable
  },
  {
    name: "Transit Van",
    image: "/van.jpg",
    capacity: "Up to 14 passengers",
    luggage: "10-14 bags",
    features: [
      "Mercedes Sprinter",
      "Comfortable seating",
      "USB charging ports",
      "Climate control",
    ],
    description: "Ideal for larger groups, corporate events, and weddings.",
    comingSoon: false,
  },
];

const FleetPage = () => {
  const fleetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure elements are mounted before animating
    if (!fleetRef.current) return;

    const cards = fleetRef.current.querySelectorAll(".fleet-card");
    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      // Initial load animation with stagger for visible cards
      gsap.from(cards, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2,
      });

      // Then set up scroll-triggered animations for cards that scroll into view
      cards.forEach((card, index) => {
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            end: "bottom 10%",
            toggleActions: "play none none none",
            once: true, // Only animate once when scrolling
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
        });
      });
    }, fleetRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <main className="min-h-screen pt-32 pb-24 px-4 bg-background font-body">
      <header className="text-center py-12 px-4 bg-background">
        <h1 className="text-6xl md:text-7xl font-luxury text-foreground/95 mb-4">
          Our Premium Fleet
        </h1>
        <p className="text-xl text-muted-foreground font-body max-w-2xl mx-auto">
          Meticulously maintained luxury vehicles for every occasion, ensuring
          comfort, safety, and style across the Canadian Rockies.
        </p>
      </header>

      {/* Fleet Grid */}
      <section ref={fleetRef} className="px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 pt-16">
          {fleetData.map((vehicle, index) => (
            <Card
              key={index}
              className="fleet-card overflow-hidden rounded-xl shadow-xl border-0 transition-all duration-300 hover:shadow-2xl hover:translate-y-[-2px] bg-card group flex flex-col"
            >
              <CardHeader className="p-0 relative h-72 overflow-hidden group">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${vehicle.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                </div>

                {/* Coming Soon Badge */}
                {vehicle.comingSoon && (
                  <div className="absolute top-4 right-4 bg-accent/90 text-accent-foreground px-4 py-2 rounded-full font-semibold text-sm shadow-lg z-20">
                    Coming Soon
                  </div>
                )}

                <h2 className="absolute bottom-4 left-6 text-4xl font-luxury text-accent-foreground drop-shadow-lg z-10">
                  {vehicle.name}
                </h2>
              </CardHeader>

              <div className="flex-grow">
                <CardContent className="p-6 space-y-6">
                  <p className="text-base text-foreground/80">
                    {vehicle.description}
                  </p>

                  <div className="flex justify-start gap-8 border-y border-muted/50 py-3 text-center">
                    <div className="space-y-1 text-left">
                      <Users className="h-5 w-5 text-accent dark:text-accent-dark" />
                      <p className="text-sm font-semibold text-foreground/80">
                        Capacity
                      </p>
                      <p className="text-base font-bold">{vehicle.capacity}</p>
                    </div>
                    <div className="space-y-1 text-left">
                      <BaggageClaim className="h-5 w-5 text-accent dark:text-accent-dark" />
                      <p className="text-sm font-semibold text-foreground/80">
                        Luggage
                      </p>
                      <p className="text-base font-bold">{vehicle.luggage}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-xl font-luxury mb-3">Key Features</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground grid grid-cols-2 gap-y-2">
                      {vehicle.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-accent dark:bg-accent-dark flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </div>

              <div className="p-6 pt-0">
                {vehicle.comingSoon ? (
                  <Button
                    disabled
                    className="w-full h-12 rounded-full bg-muted text-muted-foreground font-semibold cursor-not-allowed opacity-60"
                    size="lg"
                  >
                    Available Soon
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full h-12 rounded-full bg-accent dark:bg-accent-dark text-accent-foreground font-semibold shadow-lg transition-all hover:opacity-90 hover:scale-[1.01]"
                    size="lg"
                  >
                    <Link href="/contact">Request Booking</Link>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
};

export default FleetPage;
