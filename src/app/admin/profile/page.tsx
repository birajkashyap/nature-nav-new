import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/auth-admin";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./Client";

export default async function AdminProfilePage() {
  const session = await getServerSession(adminAuthOptions);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/admin/signin");
  }

  // Fetch all bookings for the dashboard
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-luxury text-yellow-500">
              Admin Dashboard
            </h1>
            <p className="text-zinc-400">Manage bookings and payments</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-white">{session.user?.name}</p>
              <p className="text-xs text-zinc-500">Administrator</p>
            </div>
          </div>
        </header>

        <main>
          <AdminDashboardClient bookings={bookings} />
        </main>
      </div>
    </div>
  );
}
