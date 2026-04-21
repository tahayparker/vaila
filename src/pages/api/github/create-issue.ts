import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      title,
      body,
      labels,
      professorName,
      encodedIP,
      encodedLocation,
      encodedCoordinates,
      localDateTime,
    } = req.body;

    if (!title || !body || !professorName) {
      return res
        .status(400)
        .json({ error: "Title, body, and professor name are required" });
    }

    // GitHub API configuration
    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = "tahayparker";
    const repoName = "vaila";

    if (!githubToken) {
      console.error("GitHub token not configured");
      return res
        .status(500)
        .json({ error: "GitHub integration not configured" });
    }

    // Log the submission details for debugging (without sensitive data)
    console.log("Professor contact submission received:", {
      professorName,
      title,
      timestamp: localDateTime,
      hasLocation: !!encodedLocation,
      hasCoordinates: !!encodedCoordinates,
    });

    // Create GitHub issue
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

    return res.status(201).json({
      success: true,
      issue: {
        number: issueData.number,
        url: issueData.html_url,
        title: issueData.title,
      },
    });
  } catch (error: any) {
    console.error("Error creating GitHub issue:", error);
    return res.status(500).json({
      error: "Failed to create GitHub issue",
      details: error.message,
    });
  }
}
