// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// Removed import for PUBLIC_PATHS as it's no longer needed for auth checks here

// Removed requiresAuthentication function as it's no longer used

export async function middleware(req: NextRequest) {
  // Create response object - necessary for potential cookie operations by Supabase client,
  // even if we aren't actively using auth checks anymore.
  const res = NextResponse.next();

  const { pathname } = req.nextUrl;
  console.log(`[Middleware] Request received for: ${pathname}`);

  // --- Authentication Logic REMOVED ---
  // No checks for session, no redirects based on auth status.
  // All paths are allowed through by default.

  // Allow OPTIONS requests early for CORS preflight
  if (req.method === "OPTIONS") {
    console.log(`[Middleware] Allowing OPTIONS request for CORS preflight.`);
    return res;
  }

  console.log(`[Middleware] Passing request through for path "${pathname}"`);
  return res;
}

// --- Simplified Matcher ---
// Match all paths except for Next.js internal static files and image optimization.
// This ensures the middleware runs for all actual page/API routes.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
