import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const territories = await prisma.territory.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, level: true, parentId: true,
      type: { select: { id: true, name: true } },
      becameNation: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(territories);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { name, typeId, level, parentId, description, notes } = await req.json();
  if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const territory = await prisma.territory.create({
    data: { name, typeId, level: level ?? 1, parentId, description, notes },
  });
  return NextResponse.json(territory, { status: 201 });
}
