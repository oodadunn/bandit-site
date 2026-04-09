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

    const { data, error } = await supabase
      .from("call_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch calls" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
