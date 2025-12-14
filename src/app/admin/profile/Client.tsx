"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Booking {
  id: string;
  pickup: string;
  drop: string;
  date: Date;
  car: string;
  status: string;
  payment50: boolean;
  payment100: boolean;
  totalPrice: number | null;
  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
}

export default function AdminDashboardClient({ bookings }: { bookings: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCompleteRide = async (bookingId: string) => {
    if (!confirm("Are you sure you want to mark this ride as completed?")) return;

    setLoadingId(bookingId);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/complete`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        alert("Success! Final payment link generated.");
        window.location.reload();
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to complete ride");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-zinc-950">
          <TableRow className="border-zinc-800 hover:bg-zinc-950">
            <TableHead className="text-zinc-400">Booking ID</TableHead>
            <TableHead className="text-zinc-400">Customer</TableHead>
            <TableHead className="text-zinc-400">Vehicle</TableHead>
            <TableHead className="text-zinc-400">Date</TableHead>
            <TableHead className="text-zinc-400">Status</TableHead>
            <TableHead className="text-zinc-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id} className="border-zinc-800 hover:bg-zinc-800/50">
              <TableCell className="font-mono text-xs text-zinc-500">
                {booking.id.slice(-8)}
              </TableCell>
              <TableCell>
                <div className="font-medium text-zinc-200">
                  {booking.user.name || "Guest"}
                </div>
                <div className="text-xs text-zinc-500">{booking.user.email}</div>
                {booking.user.phone && (
                  <div className="text-xs text-zinc-500 mt-0.5">
                    📞 {booking.user.phone}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-zinc-300">{booking.car}</TableCell>
              <TableCell className="text-zinc-300">
                {format(new Date(booking.date), "MMM d, p")}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    booking.status === "Completed"
                      ? "bg-green-900/20 text-green-400 border-green-900/50"
                      : booking.status === "Approved"
                      ? "bg-blue-900/20 text-blue-400 border-blue-900/50"
                      : booking.status === "AwaitingFinalPayment"
                      ? "bg-yellow-900/20 text-yellow-400 border-yellow-900/50"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  {booking.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {booking.status === "Approved" && (
                  <Button
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700 text-black"
                    onClick={() => handleCompleteRide(booking.id)}
                    disabled={loadingId === booking.id}
                  >
                    {loadingId === booking.id ? "Processing..." : "Complete Ride"}
                  </Button>
                )}
                {booking.status === "AwaitingFinalPayment" && (
                  <span className="text-xs text-yellow-500 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" /> Awaiting Payment
                  </span>
                )}
                {booking.status === "Completed" && (
                  <span className="text-xs text-green-500 flex items-center justify-end gap-1">
                    <CheckCircle className="w-3 h-3" /> Done
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
