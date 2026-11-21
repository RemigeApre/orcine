import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const items = await prisma.inspirationPlace.findMany({
    orderBy: { name: "asc" },
    include: { themes: { orderBy: { name: "asc" } } },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const { name, region, notes } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const item = await prisma.inspirationPlace.create({
    data: { name: name.trim(), region: region?.trim() || null, notes: notes?.trim() || null },
    include: { themes: true },
  });
  return NextResponse.json(item, { status: 201 });
}
