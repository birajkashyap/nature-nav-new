const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBookings() {
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { totalPrice: null },
        { depositAmount: null },
      ],
      status: 'Approved',
    },
  });

  console.log(`Found ${bookings.length} bookings with missing price data`);

  for (const booking of bookings) {
    // Set default prices (you can adjust these)
    const defaultTotalPrice = 200; // $200 CAD
    const defaultDeposit = defaultTotalPrice * 0.5; // 50%

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        totalPrice: booking.totalPrice || defaultTotalPrice,
        depositAmount: booking.depositAmount || defaultDeposit,
      },
    });

    console.log(`Fixed booking ${booking.id.slice(-8)}: totalPrice=${defaultTotalPrice}, deposit=${defaultDeposit}`);
  }

  console.log('Done!');
  await prisma.$disconnect();
}

fixBookings().catch(console.error);
