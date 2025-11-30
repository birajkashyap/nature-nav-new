const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBooking() {
  const bookingId = process.argv[2];
  
  if (!bookingId) {
    console.log('Usage: node check_booking_detailed.js <bookingId>');
    process.exit(1);
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    console.log('Booking not found');
    await prisma.$disconnect();
    return;
  }

  console.log('Booking Details:');
  console.log('================');
  console.log('ID:', booking.id);
  console.log('Status:', booking.status);
  console.log('payment50:', booking.payment50);
  console.log('payment100:', booking.payment100);
  console.log('totalPrice:', booking.totalPrice);
  console.log('depositAmount:', booking.depositAmount);
  console.log('finalPaymentUrl:', booking.finalPaymentUrl);
  console.log('completedAt:', booking.completedAt);
  console.log('stripeSessionId:', booking.stripeSessionId);
  console.log('stripePaymentIntentId:', booking.stripePaymentIntentId);

  await prisma.$disconnect();
}

checkBooking().catch(console.error);
