import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { nationInclude } from "@/lib/nation-include";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { id } = await params;
  const nation = await prisma.nation.findUnique({ where: { id }, include: nationInclude });
  if (!nation) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(nation);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { id } = await params;
  const { name, description, notes } = await req.json();
  if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const nation = await prisma.nation.update({ where: { id }, data: { name, description, notes } });
  return NextResponse.json(nation);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.nation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
