import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const { id: placeId } = await params;
  const { themeId } = await req.json();
  if (!themeId) return NextResponse.json({ error: "themeId requis" }, { status: 400 });

  await prisma.inspirationPlace.update({
    where: { id: placeId },
    data: { themes: { connect: { id: themeId } } },
  });

  const theme = await prisma.inspirationTheme.findUnique({ where: { id: themeId } });
  return NextResponse.json(theme, { status: 201 });
}
