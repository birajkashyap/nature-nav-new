"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useActiveBooking() {
  const { data: session } = useSession();
  const [hasActiveBooking, setHasActiveBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      setHasActiveBooking(false);
      setLoading(false);
      return;
    }

    async function checkBooking() {
      try {
        const res = await fetch("/api/bookings/active");
        if (res.ok) {
          const data = await res.json();
          setHasActiveBooking(!!data.booking);
        }
      } catch (error) {
        console.error("Failed to check active booking", error);
      } finally {
        setLoading(false);
      }
    }

    checkBooking();
  }, [session]);

  return { hasActiveBooking, loading };
}
