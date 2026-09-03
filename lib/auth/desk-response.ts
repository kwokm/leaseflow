import { NextResponse } from "next/server";
import { PRIVATE_BETA_MESSAGE } from "@/lib/auth/beta-allowlist";

export function privateBetaResponse(): NextResponse {
  return NextResponse.json(
    { error: PRIVATE_BETA_MESSAGE, code: "private_beta" },
    { status: 403 }
  );
}
