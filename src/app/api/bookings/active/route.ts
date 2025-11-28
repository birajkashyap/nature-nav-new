import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/app/api/helpers/auth";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        userId,
        status: {
          notIn: ["Completed", "Cancelled"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Get active booking error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
