"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

const HERO_BACKGROUND_IMAGE = "/hero-luxury-suv.jpg";

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
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
            className={`text-6xl md:text-8xl font-luxury mb-6 
    text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]
    transition-all duration-1000 ${
      isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
    }`}
          >
            Premium Shuttle Services
          </h1>

          <p
            className={`text-xl md:text-2xl mb-10 
    text-white/90 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]
    transition-all duration-1000 delay-300 ${
      isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
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
            {!session ? (
              // NOT LOGGED IN → send to your custom login page
              <Link
                href="/login"
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-4 rounded-full shadow-lg transition-all hover:scale-105"
              >
                Book Instantly
              </Link>
            ) : (
              // LOGGED IN → take them to actual booking form
              <Link
                href="/contact"
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-4 rounded-full shadow-lg transition-all hover:scale-105"
              >
                Proceed to Booking
              </Link>
            )}

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
            {/* Logo */}
            <div className="flex justify-start mb-4">
              <img 
                src="/logo.png" 
                alt="Nature Navigator Logo" 
                className="h-16 w-auto"
              />
            </div>

            <h2 className="text-4xl font-luxury text-accent animate-fade-in">
              Exclusivity & Comfort
            </h2>

            <p className="text-xl text-foreground/80 leading-relaxed animate-fade-in-delay-1">
              <strong>Nature Navigator</strong> provides premium shuttle and
              executive transportation across the Canadian Rockies. Experience luxury travel
              with Nature Navigator's professional chauffeur services.
            </p>

            <div className="pt-4 flex items-center text-lg text-foreground/70 animate-fade-in-delay-2">
              <MapPin className="w-5 h-5 mr-2 text-accent" />
              <strong>Nature Navigator Service Area:</strong> Canmore, Banff, Jasper, Calgary,
              and more.
            </div>
          </div>

          <div className="h-96 rounded-lg shadow-xl overflow-hidden animate-fade-in-delay-3 group">
            <img
              src="https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=2070&auto=format&fit=crop"
              alt="Luxury Interior"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* FIFA 2026 PROMOTION */}
      <section className="py-24 px-4 bg-muted/30 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-2xl border-2 border-accent/30 group">
              <img
                src="/fifa-2026.png"
                alt="FIFA 2026 VIP Transportation"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-block px-4 py-2 bg-accent/20 border border-accent/50 rounded-full mb-4">
                <span className="text-accent font-semibold text-sm tracking-wide">🏆 SPECIAL EVENT</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-luxury text-accent leading-tight">
                FIFA World Cup 2026
              </h2>

              <p className="text-2xl font-semibold text-foreground/90">
                Your VIP Ride to the Tournament
              </p>

              <p className="text-lg text-foreground/70 leading-relaxed">
                Experience the excitement of FIFA World Cup 2026 in style with Nature Navigator! 
                Book your premium shuttle service for seamless transportation 
                to and from the matches. Nature Navigator delivers luxury travel you can trust.
              </p>

              <ul className="space-y-3 text-foreground/80">
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  Executive vehicles with premium amenities
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  Professional chauffeurs with local expertise
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  Direct service from Calgary to match venues
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  Group packages available for teams & fans
                </li>
              </ul>

              <div className="pt-6">
                <Link
                  href="/contact"
                  className="inline-block bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-10 py-4 rounded-full shadow-xl transition-all hover:scale-105 hover:shadow-accent/50">
                  Reserve Your FIFA 2026 Ride
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CEREMONY & ENGAGEMENT PROMOTION */}
      <section className="py-24 px-4 bg-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-accent/20 border border-accent/50 rounded-full mb-4">
                <span className="text-accent font-semibold text-sm tracking-wide">💍 SPECIAL OCCASIONS</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-luxury text-accent leading-tight">
                Ceremony & Engagement
              </h2>

              <p className="text-2xl font-semibold text-foreground/90">
                Celebrate Your Special Moments in Style
              </p>

              <p className="text-lg text-foreground/70 leading-relaxed">
                Nature Navigator provides safe and reliable transportation for all your guests, 
                ensuring comfortable drop-offs from the wedding venue at the end of the night. 
                We help your guests travel with ease so they feel relaxed and well cared for 
                in the Canadian Rockies.
              </p>

              <ul className="space-y-3 text-foreground/80">
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  Engagement Service - Starting from C$450 (Min 3 hrs)
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  Ceremony at Hotel Vista - Starting from C$350 (Min 2 hrs)
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  Luxury SUV & Transit Van options available
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  Professional chauffeurs & venue coordination
                </li>
              </ul>

              <div className="pt-6">
                <Link
                  href="/contact"
                  className="inline-block bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-10 py-4 rounded-full shadow-xl transition-all hover:scale-105 hover:shadow-accent/50">
                  Book Your Celebration Ride
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-accent/30 group">
              <img
                src="/service-ceremony.png"
                alt="Ceremony & Engagement Transportation"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
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
