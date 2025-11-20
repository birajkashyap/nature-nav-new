"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin, Star } from "lucide-react";
import Link from "next/link";

const HERO_BACKGROUND_IMAGE = "/hero-luxury-suv.jpg";

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const testimonials = [
    { name: "A. Chen", text: "Unmatched professionalism and punctuality." },
    { name: "M. Patel", text: "Vehicles are immaculate. True VIP service." },
    { name: "S. Lee", text: "Perfect corporate travel solution." },
  ];

  const parallaxOffset = scrollY * -0.2;

  return (
    <main className="min-h-screen bg-background font-body text-foreground">
      {/* HERO */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <div
          ref={bgRef}
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-100"
          style={{
            backgroundImage: `url(${HERO_BACKGROUND_IMAGE})`,
            transform: `translateY(${parallaxOffset}px)`,
          }}
        >
          {/* Dark overlay uses variable-driven colors */}
          <div className="absolute inset-0 bg-background/50 dark:bg-background/80" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1
            className={`text-6xl md:text-8xl font-luxury mb-6 text-foreground/95 transition-all duration-1000 ${
              isLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
          >
            Premium Chauffeur Services
          </h1>

          <p
            className={`text-xl md:text-2xl mb-10 text-foreground/80 transition-all duration-1000 delay-300 ${
              isLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
          >
            Experience luxury travel across the Canadian Rockies.
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-500 ${
              isLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
          >
            {/* Primary Button */}
            <Link
              href="/contact"
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-4 rounded-full shadow-lg transition-all hover:scale-105 inline-block"
            >
              Book Instantly
            </Link>

            {/* Outline Button */}
            <Link
              href="/services"
              className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground text-lg px-8 py-4 rounded-full transition-all hover:scale-105 inline-flex items-center justify-center"
            >
              Explore Services <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SUMMARY */}
      <section ref={summaryRef} className="py-24 px-4 bg-background">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-luxury text-accent animate-fade-in">
              Exclusivity & Comfort
            </h2>

            <p className="text-xl text-foreground/80 leading-relaxed animate-fade-in-delay-1">
              <strong>Nature Navigator</strong> provides VIP limousine and
              executive transportation across the Canadian Rockies.
            </p>

            <div className="pt-4 flex items-center text-lg text-foreground/70 animate-fade-in-delay-2">
              <MapPin className="w-5 h-5 mr-2 text-accent" />
              <strong>Service Area:</strong> Canmore, Banff, Jasper, Calgary,
              and more.
            </div>
          </div>

          <div className="h-96 bg-muted/50 rounded-lg shadow-xl flex items-center justify-center animate-fade-in-delay-3">
            <span className="text-muted-foreground">Image Placeholder</span>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-4 bg-muted/30 dark:bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-luxury text-center mb-16 text-foreground/95">
            Trusted by Our Clients
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-card rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6"
              >
                <div className="flex mb-4 text-accent">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-current" />
                  ))}
                </div>

                <p className="text-foreground/70 mb-4 italic leading-relaxed">
                  "{t.text}"
                </p>

                <p className="font-semibold text-sm text-foreground/95">
                  — {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-background text-center">
        <h2 className="text-4xl md:text-5xl font-luxury mb-6 text-foreground/95">
          Ready to Reserve Your VIP Ride?
        </h2>

        <p className="text-xl text-muted-foreground mb-10">
          All rides must be pre-booked.
        </p>

        <Link
          href="/contact"
          className="inline-block bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-12 py-4 rounded-full shadow-xl transition-all hover:scale-105"
        >
          Reserve Your Ride Now
        </Link>
      </section>
    </main>
  );
};

export default Home;
