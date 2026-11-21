import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const themes = await prisma.inspirationTheme.findMany({
    orderBy: { name: "asc" },
    include: { morphemes: { orderBy: [{ origin: "asc" }, { type: "asc" }] } },
  });
  return NextResponse.json(themes);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const { name, notes } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const theme = await prisma.inspirationTheme.create({
    data: { name: name.trim(), notes: notes?.trim() || null },
    include: { morphemes: true },
  });
  return NextResponse.json(theme, { status: 201 });
}
