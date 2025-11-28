import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/app/api/helpers/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (booking.status !== "Pending") {
      return NextResponse.json(
        { error: "Cannot cancel a booking that is not pending" },
        { status: 400 }
      );
    }

    await prisma.booking.update({
      where: { id },
      data: { status: "Cancelled" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
