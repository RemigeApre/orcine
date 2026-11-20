import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const { id } = await params;
  const { value, meaning, notes } = await req.json();
  if (!value?.trim()) return NextResponse.json({ error: "Valeur requise" }, { status: 400 });

  const item = await prisma.inspirationSuffix.update({
    where: { id },
    data: { value: value.trim(), meaning: meaning?.trim() || null, notes: notes?.trim() || null },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const { id } = await params;
  await prisma.inspirationSuffix.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
