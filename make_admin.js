const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'ts@gmail.com';
  console.log(`Checking user: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('User not found!');
    return;
  }

  console.log(`Current role: ${user.role}`);

  if (user.role !== 'admin') {
    console.log('Updating role to admin...');
    await prisma.user.update({
      where: { email },
      data: { role: 'admin' },
    });
    console.log('Role updated to admin.');
  } else {
    console.log('User is already an admin.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
