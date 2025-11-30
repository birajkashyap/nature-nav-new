const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const id = 'cmikvkjt90001ihlv852ir2r0';
  console.log(`Checking booking: ${id}`);

  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    console.log('Booking not found!');
    return;
  }

  console.log(`Status: ${booking.status}`);
  console.log(`Final Payment URL: ${booking.finalPaymentUrl}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
