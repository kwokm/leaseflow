import { type NextRequest, NextResponse } from "next/server";
import { LANDLORD_SESSION_COOKIE } from "@/lib/auth/constants";

export function middleware(request: NextRequest) {
  if (request.cookies.has(LANDLORD_SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const signIn = new URL("/signin", request.url);
  signIn.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
