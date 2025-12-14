"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Briefcase, Mountain, Trophy, MapPin } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Mock data for key statistics
const stats = [
  { icon: Briefcase, value: "15+", label: "Years Guiding Experience" },
  { icon: Trophy, value: "50K+", label: "Successful Transfers" },
  { icon: Mountain, value: "100+", label: "Rockies Destinations Covered" },
  { icon: MapPin, value: "24/7", label: "Availability & Support" },
];

const AboutPage = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const imageGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP Scroll Reveal for Stats and Text Sections
    const sections = gsap.utils.toArray(".about-animate");

    sections.forEach((section) => {
      gsap.fromTo(
        section as Element,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section as Element,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // GSAP Parallax for Image Grid (subtle vertical shift)
    if (imageGridRef.current) {
      gsap.to(imageGridRef.current, {
        y: -50,
        ease: "none",
        scrollTrigger: {
          trigger: imageGridRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <main
      ref={mainRef}
      className="min-h-screen pt-32 pb-24 px-4 bg-background font-body"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header and Lead */}
        <div className="text-center mb-16 about-animate">
          <h1 className="text-6xl md:text-7xl font-luxury mb-4 text-foreground/95">
            Your Nature Navigator
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Curating exceptional chauffeur and luxury travel experiences deep
            within the Canadian Rockies.
          </p>
        </div>

        {/* --- Founder Story Section --- */}
        <div className="about-animate mb-20">
          <div className="max-w-4xl mx-auto bg-card shadow-xl p-10 rounded-2xl border border-muted/30 dark:border-muted/50">
            <h2 className="text-4xl font-luxury text-accent dark:text-accent-dark mb-6 text-center">
              Our Story
            </h2>
            <div className="space-y-4 text-lg leading-relaxed text-foreground/85">
              <p>
                Founded by lifelong friends <span className="font-semibold text-accent dark:text-accent-dark">Varun</span> and <span className="font-semibold text-accent dark:text-accent-dark">Sourav</span>, Nature Navigator was created out of our love for Canmore and the stunning Bow Valley we've called home for the past five years.
              </p>
              <p>
                Our goal is to make every journey as beautiful and stress-free as the destination itself. Whether you're a local wedding venue, a family celebrating a special day, or a traveler exploring Alberta's breathtaking scenery, our professional drivers ensure you relax while we navigate nature for you.
              </p>
              <p>
                From pick-up to drop-off, Nature Navigator is your trusted partner for comfortable, reliable, and scenic transportation across the Bow Valley.
              </p>
            </div>
          </div>
        </div>

        {/* --- Stats Section --- */}
        {/* <div className="about-animate mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-card shadow-lg p-8 rounded-xl border border-muted/30 dark:border-muted/50">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <stat.icon className="h-8 w-8 text-accent dark:text-accent-dark mx-auto mb-2" />
                <p className="4xl font-luxury font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div> */}

        {/* --- History and Mission --- */}
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Company History */}
          <div className="space-y-8 about-animate">
            <h2 className="text-4xl font-luxury text-accent dark:text-accent-dark">
              Our Journey in the Rockies
            </h2>
            <p className="text-lg leading-relaxed text-foreground/80">
              Nature Navigator was founded on the principle that a journey
              through the Canadian Rockies deserves a level of luxury and
              expertise equal to the scenery itself. We began serving discerning
              clients over 15 years ago, specializing in bespoke VIP
              transportation between the Calgary International Airport (YYC) and
              the iconic destinations of Canmore, Banff, and Jasper.
            </p>
            <p className="text-lg leading-relaxed text-foreground/80">
              Our growth has been organic, fueled entirely by client
              satisfaction and referrals. We don't just drive; we guide. Our
              fleet is a curated selection of premium vehicles, and every
              chauffeur is trained not only in safety and discretion but also in
              local knowledge, ensuring your passage is seamless, comfortable,
              and truly informative.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="space-y-8 about-animate">
            <h2 className="text-4xl font-luxury text-accent dark:text-accent-dark">
              Our Guiding Principles
            </h2>
            <div className="bg-muted/30 dark:bg-muted/50 p-6 rounded-xl border-l-4 border-accent dark:border-accent-dark shadow-md">
              <p className="text-lg italic leading-relaxed text-foreground/90">
                "Our mission is to be the premier Nature Navigator for executive
                and leisure travelers. We deliver exceptional, personalized
                chauffeur services across Kananaskis, Canmore, Banff, and the
                surrounding National Parks, guaranteeing safety, discretion, and
                an immersive travel experience."
              </p>
            </div>

            <h3 className="text-3xl font-luxury text-foreground">
              Headquarters & Contact
            </h3>
            <div className="text-lg text-foreground/80">
              <p className="font-semibold">
                105 Bow Meadows Crescent, Unit 132, T1W 2W8
              </p>
              <p>Canmore, Alberta, Canada.</p>
            </div>
          </div>
        </div>

        {/* --- Image Grid with Parallax --- */}
        <div className="mt-20 overflow-hidden rounded-xl shadow-2xl">
          <div
            ref={imageGridRef}
            className="grid grid-cols-3 gap-1 relative h-[400px]"
          >
            {/* Image Placeholder 1 (Left Column) */}
            <div
              className="col-span-1 bg-gray-600 bg-cover bg-center"
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1561490497-43bc900ac2d8?q=80&w=2070&auto=format&fit=crop)`,
              }}
            >
              <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 hover:bg-black/0" />
            </div>

            {/* Image Placeholder 2 & 3 (Right Two Columns) */}
            <div className="col-span-2 grid grid-rows-2 gap-1">
              <div
                className="row-span-1 bg-gray-700 bg-cover bg-center"
                style={{
                  backgroundImage: `url(https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop)`,
                }}
              >
                <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 hover:bg-black/0" />
              </div>
              <div
                className="row-span-1 bg-gray-800 bg-cover bg-center"
                style={{
                  backgroundImage: `url(https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2036&auto=format&fit=crop)`,
                }}
              >
                <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 hover:bg-black/0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
