import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { currentPassword, newUsername, newPassword } = await req.json();

  if (!currentPassword) {
    return NextResponse.json({ error: "Mot de passe actuel requis" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 401 });
  }

  const updateData: { username?: string; password?: string } = {};

  if (newUsername && newUsername !== user.username) {
    const taken = await prisma.user.findUnique({ where: { username: newUsername } });
    if (taken) {
      return NextResponse.json({ error: "Identifiant deja pris" }, { status: 409 });
    }
    updateData.username = newUsername;
  }

  if (newPassword) {
    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Aucune modification" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: session.userId }, data: updateData });

  return NextResponse.json({ ok: true });
}
