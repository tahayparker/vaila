import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      body,
      labels,
      professorName,
      encodedLocation,
      encodedCoordinates,
      localDateTime,
    } = await req.json();

    if (!title || !body || !professorName) {
      return NextResponse.json(
        { error: "Title, body, and professor name are required" },
        { status: 400 },
      );
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = "tahayparker";
    const repoName = "vaila";

    if (!githubToken) {
      console.error("GitHub token not configured");
      return NextResponse.json(
        { error: "GitHub integration not configured" },
        { status: 500 },
      );
    }

    console.log("Professor contact submission received:", {
      professorName,
      title,
      timestamp: localDateTime,
      hasLocation: !!encodedLocation,
      hasCoordinates: !!encodedCoordinates,
    });

    const githubResponse = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
          "User-Agent": "vaila-app",
        },
        body: JSON.stringify({
          title,
          body,
          labels: labels || [],
        }),
      },
    );

    if (!githubResponse.ok) {
      const errorData = await githubResponse.json();
      console.error("GitHub API error:", errorData);
      throw new Error(
        `GitHub API error: ${githubResponse.status} - ${errorData.message || "Unknown error"}`,
      );
    }

    const issueData = await githubResponse.json();

    console.log(
      `✅ GitHub issue created: #${issueData.number} for ${professorName}`,
    );

    return NextResponse.json(
      {
        success: true,
        issue: {
          number: issueData.number,
          url: issueData.html_url,
          title: issueData.title,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating GitHub issue:", error);
    return NextResponse.json(
      {
        error: "Failed to create GitHub issue",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
