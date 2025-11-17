// scripts/resetPassword.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1) See what users are in the DB
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });
  console.log("Existing users:");
  console.table(users);

  const email = "joe@gmail.com"; // the account you want to fix
  const newHash =
    "$2b$12$EZ510nA2s.Ksz9U3JlDIpepgsfOCZDuBKfIhyEx.7m8cI7NHpt7Q2"; // bcrypt hash you generated

  const updated = await prisma.user.update({
    where: { email },
    data: { passwordHash: newHash }, // or whatever your field is called
    select: { id: true, email: true },
  });

  console.log("Updated user:", updated);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
