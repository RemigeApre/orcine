import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

// Territoires de niveau 1 appartenant a cette nation (parentId null)
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { id } = await params;

  const territories = await prisma.territory.findMany({
    where: {
      parentId: null,
      nationPeriods: { some: { nationId: id } },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      level: true,
      type: { select: { id: true, name: true } },
      _count: { select: { children: true } },
    },
  });

  return NextResponse.json(territories);
}
