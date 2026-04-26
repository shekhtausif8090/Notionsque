import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const apiOk = <T>(data: T, status = 200) =>
  NextResponse.json(data, { status });

export const apiError = (message: string, status = 400, details?: unknown) =>
  NextResponse.json({ error: message, details }, { status });

export const apiZodError = (err: ZodError) =>
  apiError("Invalid request body", 400, err.flatten());

export async function parseJson<T = unknown>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
