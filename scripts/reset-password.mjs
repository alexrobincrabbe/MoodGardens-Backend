import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const [,, email, newPassword] = process.argv;
if (!email || !newPassword) {
  console.error('Usage: node scripts/reset-password.mjs <email> <newPassword>');
  process.exit(1);
}

const prisma = new PrismaClient();
const hash = await bcrypt.hash(newPassword, 12);
await prisma.user.update({ where: { email }, data: { passwordHash: hash } });
console.log('Password updated for', email);
process.exit(0);
