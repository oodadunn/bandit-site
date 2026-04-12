import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { fetchGA4Data, GA4DailyRow } from "@/lib/ga4";
import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_SALT = process.env.TOKEN_SALT || "bandit-salt";

function generateToken(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + TOKEN_SALT)
    .digest("hex");
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get("bandit-admin");
  if (!cookie || !cookie.value) return false;
  const expectedToken = generateToken(ADMIN_PASSWORD!);
  return cookie.value === expectedToken;
}

// ── Cache logic ────────────────────────────────────────────────────────
// We store daily rows in analytics_daily. On each request we check if
// today's row exists (meaning we've already synced today). If not, pull
// the last 30 days from GA4, upsert into Supabase, then return.

async function ensureFreshData(): Promise<GA4DailyRow[]> {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Check if we already have today's data
  const { data: todayRow } = await supabase
    .from("analytics_daily")
    .select("date")
    .eq("date", today)
    .maybeSingle();

  // If today's row exists, just return everything from the table
  if (todayRow) {
    const { data } = await supabase
      .from("analytics_daily")
      .select("*")
      .order("date", { ascending: false })
      .limit(30);
    return (data || []) as GA4DailyRow[];
  }

  // Otherwise, fetch last 30 days from GA4 and cache
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
    .toISOString()
    .slice(0, 10);

  let ga4Rows: GA4DailyRow[];
  try {
    ga4Rows = await fetchGA4Data(thirtyDaysAgo, today);
  } catch (err) {
    console.error("GA4 fetch failed:", err);
    // Fall back to whatever we have cached
    const { data } = await supabase
      .from("analytics_daily")
      .select("*")
      .order("date", { ascending: false })
      .limit(30);
    return (data || []) as GA4DailyRow[];
  }

  // Upsert into Supabase (date is the natural key)
  if (ga4Rows.length > 0) {
    const rows = ga4Rows.map((r) => ({
      id: crypto.randomUUID(),
      date: r.date,
      sessions: r.sessions,
      page_views: r.page_views,
      users: r.users,
      bounce_rate: r.bounce_rate,
      avg_session_duration: r.avg_session_duration,
      top_pages: r.top_pages,
      traffic_sources: r.traffic_sources,
    }));

    // Delete old rows for dates we're about to insert, then insert fresh
    const dates = rows.map((r) => r.date);
    await supabase.from("analytics_daily").delete().in("date", dates);
    await supabase.from("analytics_daily").insert(rows);
  }

  return ga4Rows;
}

// ── Summaries ──────────────────────────────────────────────────────────

function calculateSummary(days: GA4DailyRow[]) {
  if (days.length === 0) {
    return {
      sessions: 0,
      page_views: 0,
      users: 0,
      bounce_rate: 0,
      avg_session_duration: 0,
    };
  }
  return {
    sessions: days.reduce((s, d) => s + d.sessions, 0),
    page_views: days.reduce((s, d) => s + d.page_views, 0),
    users: days.reduce((s, d) => s + d.users, 0),
    bounce_rate:
      days.reduce((s, d) => s + d.bounce_rate, 0) / days.length,
    avg_session_duration:
      days.reduce((s, d) => s + d.avg_session_duration, 0) / days.length,
  };
}

// ── Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if GA4 credentials are configured
    const hasGA4 = !!(
      process.env.GA4_SERVICE_ACCOUNT_BASE64 && process.env.GA4_PROPERTY_ID
    );

    let dailyData: GA4DailyRow[];

    if (hasGA4) {
      // Live fetch with cache
      dailyData = await ensureFreshData();
    } else {
      // No GA4 credentials — return whatever is in the table (likely empty)
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from("analytics_daily")
        .select("*")
        .order("date", { ascending: false })
        .limit(30);
      dailyData = (data || []) as GA4DailyRow[];
    }

    const now = new Date();
    const last7Date = new Date(now.getTime() - 7 * 86400000);
    const last30Date = new Date(now.getTime() - 30 * 86400000);

    const last7 = dailyData.filter((d) => new Date(d.date) >= last7Date);
    const last30 = dailyData.filter((d) => new Date(d.date) >= last30Date);

    return NextResponse.json({
      daily: dailyData,
      summary: {
        last7: calculateSummary(last7),
        last30: calculateSummary(last30),
      },
      ga4_connected: hasGA4,
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
