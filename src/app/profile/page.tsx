"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Clock,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Booking {
  id: string;
  pickup: string;
  drop: string;
  date: string;
  car: string;
  status: string;
  payment50: boolean;
  payment100: boolean;
  finalPaymentUrl?: string;
  createdAt: string;
}

function ProfileContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [history, setHistory] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  async function fetchData() {
    try {
      const [activeRes, historyRes] = await Promise.all([
        fetch("/api/bookings/active"),
        fetch("/api/bookings/history"),
      ]);

      const activeData = await activeRes.json();
      const historyData = await historyRes.json();

      setActiveBooking(activeData.booking);
      setHistory(historyData.bookings || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(id: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: "PUT",
      });

      if (res.ok) {
        fetchData(); // Refresh data
      } else {
        alert("Failed to cancel booking");
      }
    } catch (error) {
      console.error("Cancel error:", error);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen pt-32 px-4 flex justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-luxury text-foreground">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your bookings and account details.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt="Avatar"
              className="w-12 h-12 rounded-full border border-muted"
            />
          )}
          <div>
            <p className="font-semibold text-foreground">
              {session?.user?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {session?.user?.email}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="ml-2 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
          >
            Sign Out
          </Button>
        </div>
      </header>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-center gap-3 text-green-600 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          <p>Payment successful! Your booking has been approved.</p>
        </div>
      )}

      {/* Active Booking Section */}
      <section>
        <h2 className="text-2xl font-luxury mb-6 flex items-center gap-2">
          <Car className="h-6 w-6 text-accent" /> Current Reservation
        </h2>

        {activeBooking ? (
          <Card className="border-l-4 border-l-accent shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {activeBooking.car}
                  </CardTitle>
                  <CardDescription>
                    Booking ID: {activeBooking.id}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                    {activeBooking.status}
                  </div>
                  {/* Driver Details */}
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Your Chauffeur
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {activeBooking.car.includes("SUV")
                        ? "+1 (403) 953-1998"
                        : "+1 (437) 990-4858"}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Date & Time</p>
                      <p className="text-foreground/80">
                        {format(
                          new Date(activeBooking.date),
                          "PPP 'at' p"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Route</p>
                      <p className="text-foreground/80">
                        <span className="text-muted-foreground">From:</span>{" "}
                        {activeBooking.pickup}
                      </p>
                      <p className="text-foreground/80">
                        <span className="text-muted-foreground">To:</span>{" "}
                        {activeBooking.drop}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      className={`h-5 w-5 mt-0.5 ${
                        activeBooking.payment50
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">Payment Status</p>
                      <p className="text-foreground/80">
                        {activeBooking.payment100
                          ? "Fully Paid"
                          : activeBooking.payment50
                          ? "Deposit Paid (50% Remaining)"
                          : "Pending Deposit"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {activeBooking.status === "Pending" && (
                <div className="pt-4 flex justify-end">
                  <Button
                    variant="destructive"
                    onClick={() => cancelBooking(activeBooking.id)}
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}

              {activeBooking.status === "AwaitingFinalPayment" && activeBooking.finalPaymentUrl && (
                <div className="pt-4 flex justify-end">
                  <Button
                    size="lg"
                    className="bg-accent text-accent-foreground hover:opacity-90"
                    onClick={() => window.location.href = activeBooking.finalPaymentUrl!}
                  >
                    Pay Remaining 50%
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Car className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium text-foreground/80">
                No active bookings
              </p>
              <p className="text-muted-foreground mb-6">
                Ready to plan your next trip?
              </p>
              <Button onClick={() => router.push("/contact")}>
                Book a Ride
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <Separator />

      {/* History Section */}
      <section>
        <h2 className="text-2xl font-luxury mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6 text-muted-foreground" /> Past Trips
        </h2>

        <div className="space-y-4">
          {history.length > 0 ? (
            history.map((booking) => (
              <Card key={booking.id} className="bg-card/50">
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">{booking.car}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.date), "PPP")}
                    </p>
                    <p className="text-sm">
                      {booking.pickup} → {booking.drop}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        booking.status === "Completed"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground italic">
              No past booking history found.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-4 bg-background font-body">
      <Suspense fallback={<div className="text-center pt-20">Loading...</div>}>
        <ProfileContent />
      </Suspense>
    </main>
  );
}
