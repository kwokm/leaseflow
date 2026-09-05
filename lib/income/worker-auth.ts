import "server-only";

import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export function incomeWorkerSecret(): string | undefined {
  const value = process.env.INCOME_WORKER_SECRET?.trim();
  return value || undefined;
}

function secretsEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Worker routes require `Authorization: Bearer ${INCOME_WORKER_SECRET}`.
 * Unset secret → 503 so a preview without the Studio key cannot be claimed.
 */
export function requireIncomeWorker(request: Request): NextResponse | null {
  const secret = incomeWorkerSecret();
  if (!secret) {
    return NextResponse.json(
      {
        error:
          "INCOME_WORKER_SECRET is not set on this deployment. The Studio worker cannot pull jobs.",
      },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (!token || !secretsEqual(token, secret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}
