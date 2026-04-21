// src/middleware.ts
//
// vaila has no auth — this middleware only handles maintenance mode
// and matches vacansee's logging/structure so the two codebases stay
// in sync.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_DURING_MAINTENANCE: string[] = [
  "/maintenance",
  "/docs",
  "/legal",
  "/privacy",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log(`[Middleware] Method: ${req.method}, Path: "${pathname}"`);

  const isMaintenanceModeActive =
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  if (isMaintenanceModeActive) {
    if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/api/_next/") ||
      pathname.endsWith(".ico") ||
      pathname.endsWith(".png") ||
      pathname.endsWith(".jpg") ||
      pathname.endsWith(".jpeg") ||
      pathname.endsWith(".svg") ||
      pathname.endsWith(".css") ||
      pathname.endsWith(".js") ||
      pathname === "/manifest.json" ||
      pathname.startsWith("/fonts/")
    ) {
      return NextResponse.next();
    }

    if (!ALLOWED_DURING_MAINTENANCE.includes(pathname)) {
      console.log(
        `[Middleware] Maintenance Mode ON. Path "${pathname}" is NOT allowed. Redirecting to /maintenance.`,
      );
      const maintenanceUrl = new URL("/maintenance", req.url);
      return NextResponse.redirect(maintenanceUrl, { status: 307 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
