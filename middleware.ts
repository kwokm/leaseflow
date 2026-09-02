import { type NextRequest, NextResponse } from "next/server";

/** Prototype review: the desk is open without sign-in. Re-enable the session cookie check before production. */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
