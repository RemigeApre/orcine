import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const POLITICAL_SYSTEMS = [
  "Monarchie absolue", "Monarchie constitutionnelle", "Republique",
  "Theocracie", "Oligarchie", "Aristocratie", "Empire", "Tribalisme",
  "Feodalism", "Cite-Etat", "Confederation", "Dictature", "Anarchie",
];

const TERRITORY_TYPES = [
  "Empire", "Royaume", "Grand-duche", "Duche", "Comte", "Vicomte",
  "Baronnie", "Marquisat", "Principaute", "Province", "Seigneurie",
  "Ville", "Cite", "Village", "Territoire",
];

async function main() {
  // Admin
  const existing = await prisma.user.findUnique({ where: { username: "admin" } });
  if (!existing) {
    const hash = await bcrypt.hash("changeme", 12);
    await prisma.user.create({ data: { username: "admin", password: hash, role: "ADMIN" } });
    console.log("Admin created: username=admin password=changeme");
  }

  // Political systems
  for (const name of POLITICAL_SYSTEMS) {
    await prisma.politicalSystem.upsert({
      where: { name },
      update: {},
      create: { name, isDefault: true },
    });
  }
  console.log(`${POLITICAL_SYSTEMS.length} political systems seeded`);

  // Territory types
  for (const name of TERRITORY_TYPES) {
    await prisma.territoryType.upsert({
      where: { name },
      update: {},
      create: { name, isDefault: true },
    });
  }
  console.log(`${TERRITORY_TYPES.length} territory types seeded`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
