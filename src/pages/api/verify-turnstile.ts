import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Turnstile token is required" });
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      console.error("Turnstile secret key not configured");
      return res.status(500).json({ error: "Turnstile not configured" });
    }

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
          remoteip:
            (req.headers["x-forwarded-for"] as string) ||
            req.socket.remoteAddress ||
            "",
        }),
      },
    );

    const verifyData = await verifyResponse.json();

    if (verifyData.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({
        success: false,
        error: "Turnstile verification failed",
        details: verifyData["error-codes"] || [],
      });
    }
  } catch (error: any) {
    console.error("Turnstile verification error:", error);
    return res.status(500).json({
      error: "Failed to verify Turnstile",
      details: error.message,
    });
  }
}
