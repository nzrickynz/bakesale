const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('Thinkdifferent72', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'nzricky@gmail.com' },
    update: {},
    create: {
      email: 'nzricky@gmail.com',
      name: 'Ricky',
      passwordHash,
      role: 'ORG_ADMIN',
    },
  });

  console.log('User created:', user);
  await prisma.$disconnect();
}

main().catch(console.error); 