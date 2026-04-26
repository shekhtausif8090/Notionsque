import { NextRequest, NextResponse } from "next/server";

// PATCH /api/tasks/reorder
// Body: Array<{ id: string; position: number; priority: TaskPriority }>
export async function PATCH(_req: NextRequest) {
  // TODO: implement reorder (transactional position updates within priority group)
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}
