const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function completeBooking() {
  const bookingIdSuffix = process.argv[2];
  
  if (!bookingIdSuffix) {
    console.log('Usage: node complete_booking.js <last8CharsOfBookingId>');
    process.exit(1);
  }

  // Find booking by suffix
  const bookings = await prisma.booking.findMany({
    where: {
      id: {
        endsWith: bookingIdSuffix
      }
    }
  });

  if (bookings.length === 0) {
    console.log('Booking not found');
    await prisma.$disconnect();
    return;
  }

  const booking = bookings[0];
  console.log('Found booking:', booking.id);

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      payment100: true,
      status: 'Completed',
      completedAt: new Date(),
    },
  });

  console.log('✅ Booking marked as Completed!');
  await prisma.$disconnect();
}

completeBooking().catch(console.error);
