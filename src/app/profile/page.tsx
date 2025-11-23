"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Car,
  User,
  DollarSign,
  Phone,
  Mail,
  ChevronRight,
  Bookmark,
} from "lucide-react";

// --- PLACEHOLDER MOTION COMPONENT ---
// In a real Next.js/Framer Motion project, this would be:
// import { motion } from 'framer-motion';
// For compatibility, we define a simple wrapper here.
const MotionDiv = ({
  children,
  initial,
  animate,
  transition,
  className,
  style,
  delay = 0,
}) => {
  // We'll use CSS classes to simulate a subtle fade-in based on delay for review
  const animationStyle = {
    ...style,
    opacity: 0,
    transform: "translateY(10px)",
    transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
  };

  // Use a useEffect to apply the 'animate' state (full opacity/no transform)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (document) {
        const element = document.getElementById(`motion-element-${delay}`);
        if (element) {
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
        }
      }
    }, 50); // Small delay to ensure mount

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      id={`motion-element-${delay}`}
      className={className}
      style={animationStyle}
    >
      {children}
    </div>
  );
};

// --- MOCK DATA ---
const mockUser = {
  name: "Alexandria Bennett",
  email: "alex.bennett@example.com",
  memberSince: "May 2022",
  status: "Active",
  profileImage: "https://placehold.co/100x100/1A1A1A/FFC72C?text=AB", // Placeholder matching theme
};

const mockOngoingRide = {
  active: true,
  pickup: "320 Bay St, Downtown Toronto",
  drop: "Pearson Int'l Airport (YYZ)",
  dateTime: "Nov 25, 2025 | 18:30",
  car: "Mercedes-Benz S550",
  driver: "Mr. David Lee",
  paymentStatus: "50% Paid",
  approved: true,
};

const mockPastRides = [
  {
    id: 1,
    car: "Rolls-Royce Ghost",
    date: "Oct 15, 2025",
    pickup: "Hotel X",
    drop: "City Opera",
    amount: 450,
    paymentMode: "Stripe",
    carImage: "https://placehold.co/60x60/1C1C1C/FFFFFF?text=RR",
  },
  {
    id: 2,
    car: "Audi A8 L",
    date: "Sep 22, 2025",
    pickup: "YYZ",
    drop: "Corporate HQ",
    amount: 280,
    paymentMode: "Google Pay",
    carImage: "https://placehold.co/60x60/1C1C1C/FFFFFF?text=A8",
  },
  {
    id: 3,
    car: "Bentley Mulsanne",
    date: "Aug 01, 2025",
    pickup: "Private Residence",
    drop: "Harbourfront",
    amount: 620,
    paymentMode: "Card",
    carImage: "https://placehold.co/60x60/1C1C1C/FFFFFF?text=BM",
  },
];

// --- STYLING CONSTANTS ---
// Based on user's theme: deep black background, gold accents, glassmorphism.
const BACKGROUND_IMAGE_URL =
  "https://images.unsplash.com/photo-1594537180492-e2152862c93?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const glassCardClass =
  "bg-black/40 backdrop-blur-xl border border-accent/25 rounded-2xl transition-all duration-300 shadow-2xl shadow-black/50";
const headingClass =
  "font-serif text-3xl font-bold tracking-wider text-white mb-6";
const goldGlowClass =
  "shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/40";
const accentIconClass = "w-5 h-5 text-accent/80 mr-3";

// --- HELPER COMPONENTS ---

/**
 * Reusable component for displaying key details with an icon.
 */
const DetailRow = ({ icon: Icon, label, value, valueClass = "text-white" }) => (
  <div className="flex items-start justify-between py-2 border-b border-gray-700/50 last:border-b-0">
    <div className="flex items-center text-gray-400">
      <Icon className={accentIconClass} />
      <span className="font-medium">{label}</span>
    </div>
    <span className={`text-right font-semibold ${valueClass}`}>{value}</span>
  </div>
);

/**
 * Section 1: User Header Section
 */
const UserHeader = ({ user }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="w-full"
    delay={0.2} // Placeholder delay
  >
    <Card className={`${glassCardClass} p-8`}>
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <img
          src={user.profileImage}
          alt={user.name}
          className="w-24 h-24 rounded-full border-4 border-accent/70 shadow-lg"
        />
        <div className="text-center sm:text-left flex-grow">
          <div className="flex items-center justify-center sm:justify-start space-x-3 mb-1">
            <h2 className="text-3xl font-serif font-bold text-white tracking-wide">
              {user.name}
            </h2>
            <span className="text-sm font-semibold bg-green-700/40 text-green-300 px-3 py-1 rounded-full border border-green-500/50">
              {user.status}
            </span>
          </div>
          <p className="text-gray-400 mb-1">{user.email}</p>
          <p className="text-sm text-gray-500">
            Member since{" "}
            <span className="font-semibold text-gray-400">
              {user.memberSince}
            </span>
          </p>
        </div>
      </div>
    </Card>
  </MotionDiv>
);

/**
 * Section 2: Ongoing Ride Section
 */
const OngoingRide = ({ ride }) => {
  const delay = 0.4; // Staggered delay for this card

  if (!ride.active) {
    return (
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="w-full"
        delay={delay} // Placeholder delay
      >
        <Card
          className={`${glassCardClass} p-8 text-center flex flex-col items-center justify-center min-h-[250px]`}
        >
          <Bookmark className="w-12 h-12 text-accent/60 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            You have no active rides.
          </h3>
          <p className="text-gray-400 mb-6">
            Book a premium ride now to experience true luxury travel.
          </p>
          <a href="/contact">
            <Button
              className={`w-48 h-10 rounded-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90 ${goldGlowClass}`}
            >
              Book a Ride
            </Button>
          </a>
        </Card>
      </MotionDiv>
    );
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="w-full"
      delay={delay} // Placeholder delay
    >
      <Card className={`${glassCardClass} p-8 relative overflow-hidden`}>
        {/* Soft gold border effect for ongoing ride */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/70 to-transparent"></div>

        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-2xl font-serif text-white tracking-wide">
            Ride in Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          <DetailRow
            icon={MapPin}
            label="Pickup Location"
            value={ride.pickup}
          />
          <DetailRow icon={MapPin} label="Drop Location" value={ride.drop} />
          <DetailRow
            icon={Clock}
            label="Pickup Time"
            value={ride.dateTime}
            valueClass="text-accent"
          />
          <DetailRow icon={Car} label="Car Selected" value={ride.car} />
          <DetailRow icon={User} label="Driver Assigned" value={ride.driver} />
          <DetailRow
            icon={DollarSign}
            label="Payment Status"
            value={ride.paymentStatus}
            valueClass="text-yellow-400"
          />

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
            <Button
              variant="outline"
              className={`flex-1 border-accent text-accent hover:bg-accent/10 ${goldGlowClass}`}
            >
              View Ride Details
            </Button>
            <Button
              variant="destructive"
              className="flex-1 bg-red-800/50 text-red-300 hover:bg-red-800/70"
              disabled={ride.approved}
            >
              Cancel Ride {ride.approved ? " (Approved)" : ""}
            </Button>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  );
};

/**
 * Section 3: Past Rides Section
 */
const PastRides = ({ rides }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.6 }}
    className="w-full lg:col-span-2"
    delay={0.6} // Placeholder delay
  >
    <Card className={`${glassCardClass} p-6 h-[400px] flex flex-col`}>
      <CardHeader className="p-2 mb-4">
        <CardTitle className="text-2xl font-serif text-white tracking-wide">
          Past Rides
        </CardTitle>
        <p className="text-sm text-gray-500">
          Review your history and receipts.
        </p>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-y-auto custom-scrollbar pr-2">
        <style jsx global>{`
          /* Custom scrollbar for luxury feel */
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: var(--accent);
            border-radius: 10px;
          }
        `}</style>
        <div className="space-y-4">
          {rides.map((ride, index) => (
            // Optional: Could add motion to each list item for a staggered effect
            <div
              key={ride.id}
              className="flex items-center justify-between p-3 bg-black/50 rounded-lg hover:bg-black/60 transition-colors duration-200 border border-gray-800/50"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={ride.carImage}
                  alt={ride.car}
                  className="w-12 h-12 rounded-lg border border-accent/30"
                />
                <div>
                  <p className="font-semibold text-white">{ride.car}</p>
                  <p className="text-xs text-gray-500">{ride.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-accent">${ride.amount}</p>
                <p className="text-xs text-gray-400">{ride.paymentMode}</p>
              </div>
              <Button
                variant="ghost"
                className="text-accent hover:bg-accent/10 p-2 h-auto"
              >
                Receipt <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </MotionDiv>
);

/**
 * Section 4: Support Section
 */
const SupportSection = () => (
  <MotionDiv
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.8 }}
    className="w-full"
    delay={0.8} // Placeholder delay
  >
    <Card className={`${glassCardClass} p-6`}>
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-2xl font-serif text-white tracking-wide">
          24×7 Support
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-3">
        <DetailRow
          icon={Phone}
          label="Emergency Line"
          value="+1 (800) 555-0199"
          valueClass="text-accent"
        />
        <DetailRow
          icon={Mail}
          label="Customer Service"
          value="support@luxury.com"
        />

        <div className="pt-4">
          <Button
            className={`w-full h-10 rounded-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90 ${goldGlowClass}`}
          >
            Contact Us
          </Button>
        </div>
      </CardContent>
    </Card>
  </MotionDiv>
);

/**
 * Main Profile Page Component
 */
const ProfilePage = () => {
  return (
    // Main container with background image and centering
    <div
      className="min-h-screen flex justify-center p-4 md:p-8 relative overflow-hidden"
      style={{
        backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-brightness-[0.1] pointer-events-none"></div>

      {/* Content Container - Fixed width for desktop, responsive for mobile */}
      {/* Motion for the entire content block */}
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full max-w-7xl pt-16 pb-16"
        delay={0} // Placeholder delay
      >
        {/* Floating Back Navigation */}
        <a
          href="/"
          className="absolute top-6 left-6 z-20"
          aria-label="Back to Home"
        >
          <Button
            variant="ghost"
            className={`text-white/70 hover:text-accent p-2 rounded-full transition-all duration-300 hover:bg-white/10`}
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Home
          </Button>
        </a>

        {/* Page Title */}
        <h1 className={`${headingClass} text-center mb-10 mt-10 md:mt-0`}>
          Account Dashboard
        </h1>

        {/* Main Dashboard Grid with staggered motion controlled by individual components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1 & 2: User Header, Ongoing Ride */}
          <div className="lg:col-span-2 space-y-8">
            <UserHeader user={mockUser} />
            <OngoingRide ride={mockOngoingRide} />
          </div>

          {/* Column 3: Support Section (always right column on large screens) */}
          <div className="lg:col-span-1 space-y-8">
            <SupportSection />
          </div>

          {/* Full Width Section: Past Rides */}
          <PastRides rides={mockPastRides} />
        </div>
      </MotionDiv>
    </div>
  );
};

export default ProfilePage;
