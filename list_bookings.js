const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listBookings() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log(`Found ${bookings.length} bookings:\n`);

  for (const booking of bookings) {
    console.log(`ID: ${booking.id.slice(-8)} | Status: ${booking.status} | payment50: ${booking.payment50} | payment100: ${booking.payment100} | Car: ${booking.car}`);
  }

  await prisma.$disconnect();
}

listBookings().catch(console.error);
