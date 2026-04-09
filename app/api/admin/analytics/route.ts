import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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

export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get daily analytics data
    const { data: dailyData, error: dailyError } = await supabase
      .from("analytics_daily")
      .select("*")
      .order("date", { ascending: false })
      .limit(30);

    if (dailyError) {
      console.error("Supabase error:", dailyError);
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 }
      );
    }

    // Calculate 7-day and 30-day summaries
    const now = new Date();
    const last7Date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const last7Days = (dailyData || []).filter((d) => new Date(d.date) >= last7Date);
    const last30Days = (dailyData || []).filter((d) => new Date(d.date) >= last30Date);

    const calculateSummary = (days: typeof dailyData) => {
      if (!days || days.length === 0) {
        return {
          sessions: 0,
          page_views: 0,
          users: 0,
          bounce_rate: 0,
          avg_session_duration: 0,
        };
      }

      const totalSessions = days.reduce((sum, d) => sum + (d.sessions || 0), 0);
      const totalPageViews = days.reduce((sum, d) => sum + (d.page_views || 0), 0);
      const totalUsers = days.reduce((sum, d) => sum + (d.users || 0), 0);
      const avgBounceRate =
        days.reduce((sum, d) => sum + (d.bounce_rate || 0), 0) / days.length;
      const avgSessionDuration =
        days.reduce((sum, d) => sum + (d.avg_session_duration || 0), 0) / days.length;

      return {
        sessions: totalSessions,
        page_views: totalPageViews,
        users: totalUsers,
        bounce_rate: avgBounceRate,
        avg_session_duration: avgSessionDuration,
      };
    };

    return NextResponse.json({
      daily: dailyData || [],
      summary: {
        last7: calculateSummary(last7Days),
        last30: calculateSummary(last30Days),
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
