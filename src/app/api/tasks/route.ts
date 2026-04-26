import { NextRequest, NextResponse } from "next/server";

// GET /api/tasks
// Query params: status, priority, search, sortBy, sortDir
export async function GET(_req: NextRequest) {
  // TODO: implement list with filters + sort
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}

// POST /api/tasks
// Body: { title, description?, status?, priority?, position?, customFields? }
export async function POST(_req: NextRequest) {
  // TODO: implement create
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}
