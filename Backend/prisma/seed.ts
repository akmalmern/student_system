import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = 'Admin12345!';

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log('✅ Admin mavjud:', email);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      firstName: 'Admin',
      lastName: 'System',
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  console.log('✅ Admin yaratildi:', email, password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
