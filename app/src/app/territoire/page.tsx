import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import TerritoireClient from "@/components/territoire/TerritoireClient";

export default async function TerritoirePage() {
  const session = await getSession();
  if (!session) redirect("/");

  const [nations, territories, politicalSystems, territoryTypes, identities] = await Promise.all([
    prisma.nation.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.territory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, level: true, parentId: true, type: { select: { id: true, name: true } } },
    }),
    prisma.politicalSystem.findMany({ orderBy: { name: "asc" } }),
    prisma.territoryType.findMany({ orderBy: { name: "asc" } }),
    prisma.identity.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <>
      <PageHeader title="Territoire" />
      <TerritoireClient
        initialNations={nations}
        initialTerritories={territories}
        politicalSystems={politicalSystems}
        territoryTypes={territoryTypes}
        identities={identities}
        isAdmin={session.role === "ADMIN"}
      />
    </>
  );
}
