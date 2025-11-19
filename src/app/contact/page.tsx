"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

gsap.registerPlugin(ScrollTrigger);

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
      className="min-h-screen pt-32 pb-24 px-4 bg-background font-body"
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
            <h2 className="text-4xl font-luxury text-accent dark:text-accent-dark">
              Reserve Your Ride
            </h2>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Full Name
                </Label>
                <Input id="name" placeholder="John Doe" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="details" className="text-base">
                  Trip Details
                </Label>
                <Textarea
                  id="details"
                  placeholder="Please provide details about your trip (pickup location, destination, date, time, number of passengers, etc.)"
                  rows={5}
                />
              </div>
              <p className="text-sm text-muted-foreground pt-2">
                **All rides must be pre-booked to ensure availability and a
                flawlessly planned experience.** A member of our team will
                contact you to confirm your booking.
              </p>
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-full bg-accent dark:bg-accent-dark text-accent-foreground font-semibold shadow-lg transition-all hover:opacity-90 hover:scale-[1.01]"
              >
                Submit Booking Request
              </Button>
            </form>
          </div>

          <div className="space-y-8 contact-animate">
            <div className="grid grid-cols-2 gap-6">
              {contactInfo.map((item) => (
                <Card
                  key={item.title}
                  className="bg-card p-6 rounded-xl shadow-lg border-0"
                >
                  <item.icon className="h-8 w-8 text-accent dark:text-accent-dark mb-3" />
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
                <AccordionTrigger className="text-lg font-semibold text-left py-4 text-foreground/90 hover:text-accent dark:hover:text-accent-dark">
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
