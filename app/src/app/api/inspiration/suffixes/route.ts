import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json([], { status: 200 }); }
export async function POST() { return NextResponse.json({ error: "Remplace par /themes" }, { status: 410 }); }
