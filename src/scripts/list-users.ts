// scripts/list-users.ts
import { prisma } from "../prismaClient.js"

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    console.log("Found users:", users.length);
    console.log("-----------------------------------");

    for (const u of users) {
      console.log(`${u.id}  |  ${u.email}`);
    }

    console.log("-----------------------------------");
  } catch (err) {
    console.error("Error fetching users:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
