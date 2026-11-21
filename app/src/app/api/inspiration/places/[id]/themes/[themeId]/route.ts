import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string; themeId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const { id: placeId, themeId } = await params;
  await prisma.inspirationPlace.update({
    where: { id: placeId },
    data: { themes: { disconnect: { id: themeId } } },
  });
  return NextResponse.json({ ok: true });
}
