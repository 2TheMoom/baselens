import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const maxDuration = 60;

const GITHUB_ORG = "base";
// Hard stop so one run can't run long enough to hit the serverless timeout.
const MAX_NEW_PER_RUN = 10;
// Without a token we're capped at 60 GitHub API requests/hour, so keep the
// scan small enough to fit that. With GITHUB_TOKEN set, scan the whole org.
const REPO_SCAN_LIMIT = process.env.GITHUB_TOKEN ? 200 : 40;

function githubHeaders() {
  const headers: Record<string, string> = {
    "User-Agent": "BaseLens-App",
    Accept: "application/vnd.github.v3+json"
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

type GithubRepo = {
  name: string;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
};

// Discovers active repos in the Base org instead of relying on a hardcoded
// list — the hardcoded list is what silently went stale last time (two 404s,
// one repo with zero releases ever). Sorted by most recently pushed so the
// repos most likely to have a fresh release get checked first if the scan
// limit is hit.
async function fetchActiveRepos(): Promise<GithubRepo[]> {
  const repos: GithubRepo[] = [];
  let url: string | null = `https://api.github.com/orgs/${GITHUB_ORG}/repos?per_page=100&type=public`;

  while (url) {
    const res: Response = await fetch(url, { headers: githubHeaders() });
    if (!res.ok) {
      console.log(`Failed to list ${GITHUB_ORG} repos - status ${res.status}`);
      break;
    }

    const page: GithubRepo[] = await res.json();
    repos.push(...page);

    const link = res.headers.get("link");
    const next = link?.split(",").find((part) => part.includes('rel="next"'));
    const match = next?.match(/<([^>]+)>/);
    url = match ? match[1] : null;
  }

  return repos
    .filter((repo) => !repo.fork && !repo.archived)
    .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
    .slice(0, REPO_SCAN_LIMIT);
}

async function analyzeWithAI(text: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OpenAI key");

  const systemPrompt = `
You are a senior blockchain upgrade analyst writing for BaseLens, a Web3 intelligence platform focused on Base blockchain.

Your job is to analyze Base blockchain upgrade announcements and produce rich, detailed, insightful analysis even if the release notes are brief.

Rules:
- Write a UNIQUE, specific, descriptive title that clearly identifies this Base upgrade
- summary: 3-4 sentences explaining the upgrade in plain English for non-technical users
- category: one of: Security, Performance, Feature, Infrastructure, Maintenance, Governance
- what_changed: 3-5 sentences describing exactly what was modified, added, or removed in this release
- why_it_changed: 3-4 sentences explaining the technical or strategic reason behind this change for Base
- user_impact: 3-4 sentences on how this affects everyday Base users, airdrop farmers, and creators
- developer_impact: 3-4 sentences on how this affects developers building on Base
- significance_reason: 3-4 sentences on why this upgrade matters for the Base ecosystem and Web3 broadly
- impact_level: one of: High, Medium, Low based on how significantly this changes Base

Even if the source notes are short, use your knowledge of Base and the OP Stack to provide full, rich analysis.

Return ONLY valid JSON with no extra text, no markdown, no backticks:
{
  "title": string,
  "summary": string,
  "category": string,
  "what_changed": string,
  "why_it_changed": string,
  "user_impact": string,
  "developer_impact": string,
  "significance_reason": string,
  "impact_level": "High" | "Medium" | "Low"
}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  });

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error("No AI response");

  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

export async function GET() {
  try {
    console.log("Auto-fetch started — discovering active Base repos...");

    const repos = await fetchActiveRepos();
    console.log(`Scanning ${repos.length} active (non-fork, non-archived) repos in ${GITHUB_ORG} org`);

    let newCount = 0;
    let skippedCount = 0;

    for (const repo of repos) {
      if (newCount >= MAX_NEW_PER_RUN) {
        console.log(`Reached ${MAX_NEW_PER_RUN} new upgrades this run — stopping early, rest picked up next run`);
        break;
      }

      const releasesUrl = `https://api.github.com/repos/${GITHUB_ORG}/${repo.name}/releases?per_page=3`;
      const res = await fetch(releasesUrl, { headers: githubHeaders() });

      if (!res.ok) {
        continue;
      }

      const releases = await res.json();
      if (!Array.isArray(releases) || releases.length === 0) {
        continue;
      }

      for (const release of releases) {
        if (newCount >= MAX_NEW_PER_RUN) break;

        const title = release.name || release.tag_name;
        const body = release.body || "";
        const releaseUrl = release.html_url;

        if (!body || body.length < 20) {
          skippedCount++;
          continue;
        }

        // Check if already analyzed
        const { data: existing } = await supabase
          .from("public_upgrades")
          .select("id")
          .eq("source_url", releaseUrl)
          .limit(1);

        if (existing && existing.length > 0) {
          skippedCount++;
          continue;
        }

        // Analyze with AI
        console.log(`Analyzing: ${repo.name} — ${title}`);
        const content = `Base blockchain release (${repo.name}): ${title}\n\nRelease notes:\n${body}`;
        const analyzed = await analyzeWithAI(content);

        // Save to public_upgrades
        const { error } = await supabase.from("public_upgrades").insert([{
          title: analyzed.title,
          summary: analyzed.summary,
          category: analyzed.category,
          what_changed: analyzed.what_changed,
          why_it_changed: analyzed.why_it_changed,
          user_impact: analyzed.user_impact,
          developer_impact: analyzed.developer_impact,
          significance_reason: analyzed.significance_reason,
          impact_level: analyzed.impact_level,
          source_url: releaseUrl
        }]);

        if (error) {
          console.error("Insert error:", error);
        } else {
          newCount++;
        }
      }
    }

    console.log(`Done. ${newCount} new, ${skippedCount} skipped, ${repos.length} repos scanned.`);

    return NextResponse.json({
      message: `Done. ${newCount} new upgrades analyzed, ${skippedCount} skipped, ${repos.length} repos scanned.`
    });

  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    console.error("Auto-fetch error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
