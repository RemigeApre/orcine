import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MorphemeType, MorphemeOrigin } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const { id: themeId } = await params;
  const { value, type, origin, notes } = await req.json();
  if (!value?.trim()) return NextResponse.json({ error: "Valeur requise" }, { status: 400 });
  if (!type || !origin) return NextResponse.json({ error: "Type et origine requis" }, { status: 400 });

  const morpheme = await prisma.inspirationMorpheme.create({
    data: {
      themeId,
      value: value.trim(),
      type: type as MorphemeType,
      origin: origin as MorphemeOrigin,
      notes: notes?.trim() || null,
    },
  });
  return NextResponse.json(morpheme, { status: 201 });
}
