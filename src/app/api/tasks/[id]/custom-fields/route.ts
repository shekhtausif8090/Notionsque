import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/tasks/[id]/custom-fields
// Body: { key: string; value?: string | number | boolean }
//   - value present → set
//   - value omitted → remove key
export async function PATCH(_req: NextRequest, _ctx: RouteContext) {
  // TODO: implement set / remove custom field key
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}
