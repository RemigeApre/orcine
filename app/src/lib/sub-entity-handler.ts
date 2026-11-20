import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

type PrismaDelegate = {
  create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
  delete: (args: { where: { id: string } }) => Promise<Record<string, unknown>>;
  update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
};

export function getDelegate(table: string): PrismaDelegate {
  return (prisma as unknown as Record<string, PrismaDelegate>)[table];
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export function subEntityPost(
  table: string,
  parentKey: string,
  parentId: string,
  body: Record<string, unknown>
) {
  const delegate = getDelegate(table);
  return delegate.create({ data: { [parentKey]: parentId, ...body } });
}

export async function handleSubPost(
  req: NextRequest,
  table: string,
  parentKey: string,
  parentId: string
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Interdit" }, { status: 403 });
  const body = await req.json();
  const result = await subEntityPost(table, parentKey, parentId, body);
  return NextResponse.json(result, { status: 201 });
}

export async function handleSubDelete(
  req: NextRequest,
  table: string
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Interdit" }, { status: 403 });
  const { id } = await req.json();
  const delegate = getDelegate(table);
  await delegate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function handleSubPut(
  req: NextRequest,
  table: string
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Interdit" }, { status: 403 });
  const { id, ...data } = await req.json();
  const delegate = getDelegate(table);
  const result = await delegate.update({ where: { id }, data });
  return NextResponse.json(result);
}
