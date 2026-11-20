import { NextRequest } from "next/server";
import { handleSubPost, handleSubDelete } from "@/lib/sub-entity-handler";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return handleSubPost(req, "nationSynonym", "nationId", id);
}

export async function DELETE(req: NextRequest) {
  return handleSubDelete(req, "nationSynonym");
}
