import { NextRequest, NextResponse } from "next/server";

// POST /api/tasks/bulk
// Body: { tasks: NewTask[] }
export async function POST(_req: NextRequest) {
  // TODO: implement bulk create
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}

// PATCH /api/tasks/bulk
// Body: { ids: string[], patch: Partial<Task> }
export async function PATCH(_req: NextRequest) {
  // TODO: implement bulk update (status / priority / etc.)
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}

// DELETE /api/tasks/bulk
// Body: { ids: string[] }
export async function DELETE(_req: NextRequest) {
  // TODO: implement bulk delete
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}
