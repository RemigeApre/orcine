import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const systems = await prisma.politicalSystem.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(systems);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const existing = await prisma.politicalSystem.findUnique({ where: { name } });
  if (existing) return NextResponse.json({ error: "Existe deja" }, { status: 409 });

  const system = await prisma.politicalSystem.create({ data: { name } });
  return NextResponse.json(system, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { id } = await req.json();
  await prisma.politicalSystem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
