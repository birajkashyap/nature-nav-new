"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plane, Building2, Heart, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);

// Type definitions (left as provided by the user)
interface PricingDetail {
  name: string;
  details: string;
  price: string;
  hourly_suv?: string;
  hourly_van?: string;
}

interface RouteDetail {
  vehicle: string;
  route: string;
  price: string;
}

interface ServiceData {
  icon: any;
  title: string;
  image: string;
  description: string;
  features: string[];
  pricing?: PricingDetail[];
  routes?: RouteDetail[];
}

const servicesData: ServiceData[] = [
  {
    icon: Heart,
    title: "Events & Wedding Shuttle",
    image: "/service-wedding.png",
    description:
      "Elegant, coordinated transportation for your special day, covering venues across the Rockies.",
    pricing: [
      {
        name: "Standard Wedding Shuttle",
        details:
          "10:00 PM – 2:00 AM, includes luxury shuttle, chauffeur, fuel, and coordination. Final 30 minutes (2:00 AM-2:30 AM) complimentary.",
        price: "C$850 + GST",
        hourly_suv: "C$163/Hr",
        hourly_van: "C$213/Hr",
      },
    ],
    features: [
      "Professional Coordination",
      "Red Carpet Service",
      "Multi-Vehicle Options (SUV, Van, Shuttle)",
      "Flexible Time Packages",
    ],
  },
  {
    icon: Plane,
    title: "Airport Transfers (YYC)",
    image: "/service-airport.png",
    description:
      "Reliable executive transfers between Calgary International Airport (YYC) and the Canadian Rockies.",
    routes: [
      {
        vehicle: "Luxury SUV (5 Pax)",
        route: "YYC → Canmore",
        price: "C$518.44",
      },
      {
        vehicle: "Luxury SUV (5 Pax)",
        route: "Canmore → YYC",
        price: "C$518.44",
      },
      {
        vehicle: "Luxury SUV (5 Pax)",
        route: "YYC → Banff",
        price: "C$681.45",
      },
      {
        vehicle: "Luxury SUV (5 Pax)",
        route: "Banff → YYC",
        price: "C$681.45",
      },
      {
        vehicle: "Transit Van (14 Pax)",
        route: "YYC → Canmore",
        price: "C$685.13",
      },
      {
        vehicle: "Transit Van (14 Pax)",
        route: "Canmore → YYC",
        price: "C$685.13",
      },
      {
        vehicle: "Transit Van (14 Pax)",
        route: "YYC → Banff",
        price: "C$897.00",
      },
      {
        vehicle: "Transit Van (14 Pax)",
        route: "Banff → YYC",
        price: "C$897.00",
      },
    ],
    features: [
      "Meet & greet service",
      "Flight tracking",
      "Complimentary wait time",
      "24/7 availability",
    ],
  },
  {
    icon: Building2,
    title: "Corporate & VIP Travel",
    image: "/service-corporate.jpg",
    description:
      "Professional and discreet solutions for executives, roadshows, and business professionals.",
    features: [
      "Dedicated account manager",
      "Priority booking",
      "Complete discretion",
      "Corporate billing options",
    ],
  },
  {
    icon: MapPin,
    title: "Ceremony & Engagement",
    image: "/service-ceremony.png",
    description:
      "Elegant transportation for your engagement celebrations and hotel ceremonies in the stunning Canadian Rockies.",
    pricing: [
      {
        name: "Ceremony Pick-Up",
        details:
          "Minimum 3 hours. Guest transfers for ceremonies and special events.",
        price: "C$650 + GST (Min)",
        hourly_suv: "C$163/Hr",
        hourly_van: "C$213/Hr",
      },
      {
        name: "Wedding Venue at Vista",
        details:
          "Minimum 2 hours. Guest transfers to/from Vista wedding venue, Canmore.",
        price: "C$450 + GST (Min)",
        hourly_suv: "C$163/Hr",
        hourly_van: "C$213/Hr",
      },
    ],
    features: [
      "Luxury vehicle options",
      "Professional chauffeurs",
      "Coordination with venue",
      "Flexible scheduling",
    ],
  },
];

const ServicesPage = () => {
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".service-card");

      cards.forEach((card, index) => {
        gsap.fromTo(
          card as Element,
          {
            y: 60,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            delay: index * 0.1,
            scrollTrigger: {
              trigger: card as Element,
              start: "top 85%",
              end: "top 60%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, servicesRef);

    return () => {
      ctx.revert();
    };
  }, []);

  // Helper component for Pricing Boxes
  const PricingBox = ({ service }: { service: ServiceData }) => {
    if (service.title.includes("Wedding") && service.pricing) {
      const shuttle = service.pricing[0];
      const addOn = service.pricing[1];

      return (
        <div className="space-y-4 pt-3">
          <h3 className="text-xl font-luxury text-accent dark:text-accent-dark">
            Pricing Summary
          </h3>

          {/* Standard Shuttle */}
          {shuttle && (
            <Card className="bg-muted/30 dark:bg-muted/50 p-4 border-l-4 border-accent dark:border-accent-dark shadow-sm">
              <p className="text-sm font-semibold mb-1">{shuttle.name}</p>
              <p className="text-2xl font-bold text-foreground mb-2">
                {shuttle.price}
              </p>
              <div className="flex justify-between text-xs text-foreground/70">
                <span>
                  SUV Hourly: <strong>{shuttle.hourly_suv}</strong>
                </span>
                <span>
                  VAN Hourly: <strong>{shuttle.hourly_van}</strong>
                </span>
              </div>
            </Card>
          )}

          {/* Add-On */}
          {addOn && (
            <Card className="bg-muted/30 dark:bg-muted/50 p-4 border-l-4 border-muted/50 shadow-sm">
              <p className="text-sm font-semibold mb-1">{addOn.name}</p>
              <p className="text-xl font-bold text-foreground/80">
                {addOn.price}
              </p>
              <p className="text-xs text-foreground/70">{addOn.details}</p>
            </Card>
          )}
        </div>
      );
    }

    if (service.title.includes("Airport") && service.routes) {
      return (
        <div className="space-y-3 pt-3">
          <h3 className="text-xl font-luxury text-accent dark:text-accent-dark">
            YYC Route Pricing
          </h3>

          {service.routes.map((route, i) => (
            <div
              key={i}
              className="flex justify-between items-center text-sm border-b border-muted/50 pb-2"
            >
              <span className="font-semibold text-foreground/90">
                {route.route} ({route.vehicle})
              </span>
              <span className="text-xl font-bold text-accent dark:text-accent-dark">
                {route.price}
              </span>
            </div>
          ))}

          <p className="text-xs text-foreground/70 pt-2">
            *Prices are one-way and subject to change.
          </p>
        </div>
      );
    }

    // Ceremony & Engagement pricing display
    if (service.title.includes("Ceremony") && service.pricing) {
      const engagement = service.pricing[0];
      const ceremony = service.pricing[1];

      return (
        <div className="space-y-4 pt-3">
          <h3 className="text-xl font-luxury text-accent dark:text-accent-dark">
            Pricing Summary
          </h3>

          {/* Engagement Service */}
          {engagement && (
            <Card className="bg-muted/30 dark:bg-muted/50 p-4 border-l-4 border-accent dark:border-accent-dark shadow-sm">
              <p className="text-sm font-semibold mb-1">{engagement.name}</p>
              <p className="text-2xl font-bold text-foreground mb-2">
                {engagement.price}
              </p>
              <p className="text-xs text-foreground/70 mb-2">{engagement.details}</p>
              <div className="flex justify-between text-xs text-foreground/70">
                <span>
                  SUV: <strong>{engagement.hourly_suv}</strong>
                </span>
                <span>
                  VAN: <strong>{engagement.hourly_van}</strong>
                </span>
              </div>
            </Card>
          )}

          {/* Ceremony at Hotel Vista */}
          {ceremony && (
            <Card className="bg-muted/30 dark:bg-muted/50 p-4 border-l-4 border-muted/50 shadow-sm">
              <p className="text-sm font-semibold mb-1">{ceremony.name}</p>
              <p className="text-xl font-bold text-foreground/80 mb-2">
                {ceremony.price}
              </p>
              <p className="text-xs text-foreground/70 mb-2">{ceremony.details}</p>
              <div className="flex justify-between text-xs text-foreground/70">
                <span>
                  SUV: <strong>{ceremony.hourly_suv}</strong>
                </span>
                <span>
                  VAN: <strong>{ceremony.hourly_van}</strong>
                </span>
              </div>
            </Card>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-4 bg-background font-body">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-luxury mb-4 text-foreground/95">
            Our Premium Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive transportation solutions tailored to your exact needs,
            delivered with precision and luxury.
          </p>
        </div>

        <div ref={servicesRef} className="grid lg:grid-cols-2 gap-12">
          {servicesData.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card
                key={index}
                className="service-card rounded-xl shadow-xl border-0 transition-all duration-300 hover:shadow-2xl hover:translate-y-[-2px] bg-card overflow-hidden group 
                
                flex flex-col" // 💡 FIX: Make the card a Flex column
              >
                {/* Image Header Area */}
                <div
                  className="relative h-48 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${service.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent/30" />
                  <IconComponent className="absolute bottom-4 left-6 h-10 w-10 text-accent dark:text-accent-dark drop-shadow-lg" />
                </div>

                <CardHeader className="p-6 pb-0">
                  <CardTitle className="text-3xl font-luxury text-foreground">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-base text-foreground/70">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                {/* 💡 FIX: Wrap dynamic content in flex-grow container */}
                <div className="flex-grow">
                  <CardContent className="p-6 pt-4 grid md:grid-cols-2 gap-6">
                    {/* Pricing / Routes Column (Conditional) */}
                    {(service.pricing || service.routes) && (
                      <div className="space-y-3">
                        <PricingBox service={service} />
                      </div>
                    )}

                    {/* Features Column (Always present) */}
                    <div
                      className={`space-y-3 ${
                        service.pricing || service.routes
                          ? "border-l border-muted/50 pl-6"
                          : "md:col-span-2"
                      }`}
                    >
                      <h3 className="text-xl font-luxury">Key Features</h3>
                      <ul className="space-y-2">
                        {service.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-foreground/80"
                          >
                            <div className="h-1.5 w-1.5 rounded-full mt-2 flex-shrink-0 bg-accent dark:bg-accent-dark" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </div>
                {/* End of flex-grow wrapper */}

                {/* CTA Footer - Will now be pushed to the bottom */}
                <div className="p-6 pt-0">
                  <Button
                    asChild
                    className="w-full h-12 rounded-full bg-accent dark:bg-accent-dark text-accent-foreground font-semibold shadow-lg transition-all hover:opacity-90 hover:scale-[1.01]"
                    size="lg"
                  >
                    <Link href="/contact">Book {service.title}</Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default ServicesPage;
