import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import TerritoireClient from "@/components/territoire/TerritoireClient";

export default async function TerritoirePage() {
  const session = await getSession();
  if (!session) redirect("/");

  const [nations, territories, politicalSystems, territoryTypes, identities] = await Promise.all([
    prisma.nation.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        images: {
          where: { isCurrent: true, type: "FLAG" },
          select: { filePath: true },
          take: 1,
        },
      },
    }),
    prisma.territory.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        level: true,
        parentId: true,
        type: { select: { id: true, name: true } },
      },
    }),
    prisma.politicalSystem.findMany({ orderBy: { name: "asc" } }),
    prisma.territoryType.findMany({ orderBy: { name: "asc" } }),
    prisma.identity.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const nationsWithFlag = nations.map((n) => ({
    id: n.id,
    name: n.name,
    flagPath: n.images[0]?.filePath ?? null,
  }));

  return (
    <TerritoireClient
      initialNations={nationsWithFlag}
      initialTerritories={territories}
      politicalSystems={politicalSystems}
      territoryTypes={territoryTypes}
      identities={identities}
      isAdmin={session.role === "ADMIN"}
    />
  );
}
