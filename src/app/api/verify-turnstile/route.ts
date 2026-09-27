import { NextRequest, NextResponse } from "next/server";
import { getClientIpFromHeaders } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Turnstile token is required" },
        { status: 400 },
      );
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      console.error("Turnstile secret key not configured");
      return NextResponse.json(
        { error: "Turnstile not configured" },
        { status: 500 },
      );
    }

    const clientIp = getClientIpFromHeaders(req.headers);

    // Verify the token with Cloudflare
    const verifyResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
          remoteip: clientIp || "",
        }),
      },
    );

    const verifyData = await verifyResponse.json();

    if (verifyData.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Turnstile verification failed",
          details: verifyData["error-codes"] || [],
        },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("Turnstile verification error:", error);
    return NextResponse.json(
      {
        error: "Failed to verify Turnstile",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
