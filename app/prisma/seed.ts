import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { username: "admin" } });
  if (existing) {
    console.log("Admin already exists, skipping seed.");
    return;
  }

  const hash = await bcrypt.hash("changeme", 12);
  await prisma.user.create({
    data: {
      username: "admin",
      password: hash,
      role: "ADMIN",
    },
  });

  console.log("Admin created: username=admin password=changeme");
  console.log("Change the password immediately after first login.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
