import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/app/api/helpers/auth";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        status: {
          in: ["Completed", "Cancelled"],
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("Get booking history error:", error);
    console.error("Stack:", error.stack);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
