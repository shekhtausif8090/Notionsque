import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/tasks/[id]
export async function GET(_req: NextRequest, _ctx: RouteContext) {
  // TODO: implement fetch by id
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}

// PATCH /api/tasks/[id]
// Body: partial Task fields
export async function PATCH(_req: NextRequest, _ctx: RouteContext) {
  // TODO: implement partial update
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}

// DELETE /api/tasks/[id]
export async function DELETE(_req: NextRequest, _ctx: RouteContext) {
  // TODO: implement delete
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}
