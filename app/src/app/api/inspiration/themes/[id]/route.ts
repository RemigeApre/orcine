import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const { id } = await params;
  const { name, notes } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const theme = await prisma.inspirationTheme.update({
    where: { id },
    data: { name: name.trim(), notes: notes?.trim() || null },
  });
  return NextResponse.json(theme);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const { id } = await params;
  await prisma.inspirationTheme.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
