import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { id } = await params;

  const territory = await prisma.territory.findUnique({
    where: { id },
    include: { synonyms: true, becameNation: true },
  });

  if (!territory) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (territory.becameNation) {
    return NextResponse.json({ error: "Nation deja creee", nation: territory.becameNation }, { status: 409 });
  }

  const nation = await prisma.nation.create({
    data: {
      name: territory.name,
      description: territory.description,
      notes: territory.notes,
      originTerritoryId: territory.id,
      synonyms: {
        create: territory.synonyms.map((s) => ({ name: s.name })),
      },
    },
  });

  return NextResponse.json(nation, { status: 201 });
}
