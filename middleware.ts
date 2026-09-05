import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { LANDLORD_SIGN_IN_HREF, LANDLORD_SIGN_UP_HREF } from "@/lib/auth/roles";

const isDesk = createRouteMatcher(["/dashboard(.*)"]);

/**
 * Read straight from process.env rather than lib/config/env: middleware runs on
 * the edge runtime, where the `server-only` import in that module is not valid.
 */
const DEMO = process.env.LEASEPROOF_DEMO === "1" || process.env.LEASEPROOF_DEMO === "true";
const CLERK_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

function brandedSignIn(request: NextRequest): NextResponse {
  const signIn = new URL(LANDLORD_SIGN_IN_HREF, request.url);
  signIn.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(signIn);
}

/**
 * Desk visits stay on the in-app /signin card. `auth.protect()` without a
 * sign-in URL falls through to Clerk's hosted accounts.dev page — the
 * unbranded "leaseflow-clerk / Development mode" screen from the walk.
 */
const guarded = clerkMiddleware(
  async (auth, request) => {
    if (!isDesk(request)) return NextResponse.next();

    const { userId } = await auth();
    if (!userId) return brandedSignIn(request);
    return NextResponse.next();
  },
  {
    signInUrl: LANDLORD_SIGN_IN_HREF,
    signUpUrl: LANDLORD_SIGN_UP_HREF,
  }
);

/**
 * The desk requires a Clerk session in production. Two deliberate exceptions:
 *
 * - LEASEPROOF_DEMO=1 leaves everything open so the click-through preview works.
 * - If Clerk is somehow not configured outside demo mode we fail closed and
 *   bounce to /signin, rather than silently serving an unauthenticated desk.
 */
export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (DEMO) return NextResponse.next();

  if (!CLERK_CONFIGURED) {
    if (!isDesk(request)) return NextResponse.next();
    return brandedSignIn(request);
  }

  return guarded(request, event);
}

export const config = {
  matcher: [
    // Everything except Next internals and static assets, so Clerk's request
    // context is available to server components and route handlers.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
