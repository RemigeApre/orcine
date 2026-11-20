import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { territoryInclude } from "@/lib/nation-include";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { id } = await params;
  const territory = await prisma.territory.findUnique({ where: { id }, include: territoryInclude });
  if (!territory) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(territory);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { id } = await params;
  const { name, typeId, level, parentId, description, notes } = await req.json();
  if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const territory = await prisma.territory.update({
    where: { id },
    data: { name, typeId, level, parentId, description, notes },
  });
  return NextResponse.json(territory);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.territory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
