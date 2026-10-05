import { NextResponse } from "next/server";

/** JSON error body in the `{ message }` shape every API route returns. */
export function errorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}
