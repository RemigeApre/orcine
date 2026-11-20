import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readFile } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = "/app/uploads";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { path } = await params;
  const filename = path.join("/").replace(/\.\./g, "");

  try {
    const buffer = await readFile(join(UPLOAD_DIR, filename));
    const ext = filename.split(".").pop() ?? "bin";
    const contentType =
      ext === "svg" ? "image/svg+xml" :
      ext === "gif" ? "image/gif" :
      ext === "webp" ? "image/webp" :
      ext === "png" ? "image/png" : "image/jpeg";

    return new NextResponse(buffer, {
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000" },
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }
}
