import { NextRequest, NextResponse } from "next/server";
import { runRegulationCheck } from "@/lib/regulation-check";

/**
 * Daily cron endpoint – orchestrator for manifest updates.
 * Secured with CRON_SECRET.
 * Triggered via vercel.json: schedule "0 6 * * *" (06:00 UTC daily)
 *
 * Vercel automatically sends: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[cron/daily] CRON_SECRET is not set");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const startedAt = new Date().toISOString();
    console.log(`[cron/daily] Pipeline started at ${startedAt}`);

    // Pipeline steps (extend as needed):
    // 1. Read data sources
    // 2. Run quality gates on pages_manifest.json
    // 3. Trigger ISR revalidation for updated pages (when REVALIDATE_SECRET is set)

    const results = await runDailyPipeline();

    console.log(`[cron/daily] Pipeline completed`, results);

    return NextResponse.json({
      ok: true,
      startedAt,
      completedAt: new Date().toISOString(),
      ...results,
    });
  } catch (error) {
    console.error("[cron/daily] Pipeline error:", error);
    return NextResponse.json(
      { error: "Pipeline failed", details: String(error) },
      { status: 500 }
    );
  }
}

async function runDailyPipeline(): Promise<Record<string, unknown>> {
  // Step 1: Quality gate – count indexable vs noindex pages
  const manifest = await import("@/datasets/pages_manifest.json");
  const pages = manifest.pages ?? [];
  const indexable = pages.filter((p: { quality: { indexable: boolean } }) => p.quality.indexable);
  const noindex = pages.length - indexable.length;

  // Step 2: Regelbevakning – fetch + hash-jämförelse + alert vid förändring
  const regulationResult = await runRegulationCheck();

  // Step 3: Revalidation (optional – requires REVALIDATE_SECRET)
  let revalidated = 0;
  const revalidateSecret = process.env.REVALIDATE_SECRET;
  const siteUrl = process.env.SITE_URL;
  if (revalidateSecret && siteUrl) {
    try {
      const response = await fetch(`${siteUrl}/api/revalidate?secret=${revalidateSecret}`, {
        method: "POST",
      });
      if (response.ok) revalidated = 1;
    } catch {
      // Non-fatal – revalidation is optional
    }
  }

  return {
    pagesTotal: pages.length,
    pagesIndexable: indexable.length,
    pagesNoindex: noindex,
    revalidated,
    regulationCheck: regulationResult,
  };
}
