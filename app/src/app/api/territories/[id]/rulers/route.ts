import { NextRequest } from "next/server";
import { handleSubPost, handleSubDelete, handleSubPut } from "@/lib/sub-entity-handler";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return handleSubPost(req, "territoryRuler", "territoryId", id);
}

export async function PUT(req: NextRequest) {
  return handleSubPut(req, "territoryRuler");
}

export async function DELETE(req: NextRequest) {
  return handleSubDelete(req, "territoryRuler");
}
