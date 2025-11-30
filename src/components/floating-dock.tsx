"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Car, Luggage, Building, Phone, User } from "lucide-react";
import gsap from "gsap";
import { ThemeToggle } from "./theme-toggle"; // ThemeToggle is fine
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useActiveBooking } from "@/hooks/useActiveBooking";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/fleet", label: "Fleet", icon: Car },
  { href: "/services", label: "Services", icon: Luggage },
  { href: "/about", label: "About", icon: Building },
  { href: "/contact", label: "Book", icon: Phone },
  { href: "/profile", label: "Profile", icon: User },
];

const FloatingDock = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  const { hasActiveBooking } = useActiveBooking();

  const isLoggedIn = !!session;
  const dockRef = useRef<HTMLDivElement>(null);
  // Ref type corrected to HTMLAnchorElement
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  // 1. DOCK ENTRANCE ANIMATION (Runs once)
  useEffect(() => {
    if (!dockRef.current) return;

    gsap.set(dockRef.current, { y: 100, opacity: 0 });

    gsap.to(dockRef.current, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
      delay: 0.5,
    });
  }, []);

  // 💡 FIX: Reset all non-active pills when navigation occurs.
  useEffect(() => {
    // This runs whenever pathname changes (i.e., when you click a link)
    navItems.forEach(({ href, label }) => {
      const el = linkRefs.current[label];
      // Only run cleanup if the item is NOT the newly active item
      if (el && pathname !== href) {
        // Force the pill to collapse immediately
        gsap.set(el, { width: "48px" });
        gsap.set(el.querySelector(".nav-label"), { opacity: 0 });
      }
    });

    // We also run the initial active state setting here because pathname changes
    // This ensures the new active pill (if any) expands on the new page load
    navItems.forEach(({ href, label }) => {
      if (pathname === href) {
        const activeLinkEl = linkRefs.current[label];
        if (activeLinkEl) {
          const textWidth =
            activeLinkEl.querySelector(".nav-label")?.scrollWidth || 0;
          const iconWidth = 48;

          // Set the width of the newly active link immediately
          gsap.set(activeLinkEl, {
            width: `${iconWidth + textWidth + 10}px`,
          });
        }
      }
    });
  }, [pathname]); // Reruns whenever navigation completes

  // GSAP Hover Handlers WRAPPED IN useCallback
  const handleMouseEnter = useCallback(
    (label: string) => {
      const item = navItems.find((i) => i.label === label);
      const el = linkRefs.current[label];
      // Do NOT animate if it's the current active page
      if (!el || pathname === item?.href) return;

      const textWidth = el.querySelector(".nav-label")?.scrollWidth || 0;

      // Optimized GSAP duration and ease
      gsap.to(el, {
        width: `${48 + textWidth + 10}px`,
        duration: 0.25,
        ease: "power2.inOut",
      });

      gsap.to(el.querySelector(".nav-label"), {
        opacity: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    },
    [pathname]
  );

  // 4. WRAPPED IN useCallback for performance
  const handleMouseLeave = useCallback(
    (label: string) => {
      const item = navItems.find((i) => i.label === label);
      const el = linkRefs.current[label];
      // Do NOT retract if it's the current active page
      if (!el || pathname === item?.href) return;

      // Optimized GSAP duration and ease
      gsap.to(el, {
        width: `48px`,
        duration: 0.25,
        ease: "power2.inOut",
      });

      gsap.to(el.querySelector(".nav-label"), {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      });
    },
    [pathname]
  );

  return (
    <div
      ref={dockRef}
      className="fixed z-50 w-full flex justify-center bottom-6 lg:top-6 lg:bottom-auto pointer-events-none"
    >
      <nav className="glass-dock rounded-full py-2 px-4 lg:py-3 lg:px-6 pointer-events-auto">
        <ul className="flex items-center space-x-2">
          {/* Logo */}
          <li className="pr-3 border-r border-card/30">
            <Link href="/" className="block">
              <img
                src="/logo.png"
                alt="Nature Navigator"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-accent/20 hover:ring-accent/40 transition-all"
              />
            </Link>
          </li>

          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            
            // Disable "Book" if active booking exists
            const isDisabled = label === "Book" && hasActiveBooking;

            // 💡 FIX: Set the hover text color to foreground (black/dark grey)
            const iconColorClass = isActive
              ? "text-accent-foreground"
              : isDisabled 
                ? "text-muted-foreground"
                : "text-foreground/80 group-hover:text-foreground dark:text-foreground/80 dark:group-hover:text-foreground";

            return (
              <li
                key={href}
                className={`flex items-center group ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onMouseEnter={() => !isDisabled && handleMouseEnter(label)}
                onMouseLeave={() => !isDisabled && handleMouseLeave(label)}
              >
                <Link
                  href={isDisabled ? "#" : href}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                      return;
                    }
                    // Only require login for /contact and /profile
                    if (!isLoggedIn && (href === "/contact" || href === "/profile")) {
                      e.preventDefault();
                      router.push("/login");
                    }
                  }}
                  ref={(el) => {
                    linkRefs.current[label] = el;
                  }}
                  className={`
                    relative flex items-center h-12 rounded-full overflow-hidden whitespace-nowrap
                    transition-colors duration-300
                
                    ${
                      // Active state applies accent colors
                      isActive
                        ? "bg-accent shadow-md dark:bg-accent text-accent-foreground w-auto px-2"
                        : // Inactive state applies muted background and relies on group-hover for color
                          "bg-transparent hover:bg-card/50 w-[48px] justify-center"
                    }
                  `}
                >
                  {/* ICON */}
                  <Icon
                    className={`
                      h-5 w-5 transition-colors duration-300 shrink-0
                      ${iconColorClass}
                    `}
                  />

                  {/* LABEL - Ensure the label text color is white/light when the pill is active */}
                  <span
                    className={`
                      nav-label text-sm font-semibold ml-2 pr-2 overflow-hidden 
                      transition-all duration-300 text-foreground
                      ${isActive ? "opacity-100" : "opacity-0"}
                    `}
                  >
                    {isDisabled ? "Active Booking" : label}
                  </span>
                </Link>
              </li>
            );
          })}

          <li className="pl-3 border-l border-card/30">
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default FloatingDock;
