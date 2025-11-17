// scripts/hashPassword.ts
import bcrypt from "bcryptjs";

async function main() {
  const plain = "ledashutup"; // choose your new password
  const hash = await bcrypt.hash(plain, 12);
  console.log("Hash:", hash);
}

main().catch(console.error);
