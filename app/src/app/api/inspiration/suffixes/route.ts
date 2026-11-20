import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const items = await prisma.inspirationSuffix.findMany({ orderBy: { value: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const { value, meaning, notes } = await req.json();
  if (!value?.trim()) return NextResponse.json({ error: "Valeur requise" }, { status: 400 });

  const item = await prisma.inspirationSuffix.create({
    data: { value: value.trim(), meaning: meaning?.trim() || null, notes: notes?.trim() || null },
  });
  return NextResponse.json(item, { status: 201 });
}
