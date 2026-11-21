import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string; morphemeId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const { morphemeId } = await params;
  await prisma.inspirationMorpheme.delete({ where: { id: morphemeId } });
  return NextResponse.json({ ok: true });
}
