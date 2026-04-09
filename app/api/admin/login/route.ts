import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const TOKEN_SALT = process.env.TOKEN_SALT || "bandit-salt";

function generateToken(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + TOKEN_SALT)
    .digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { ok: false, error: "Admin not configured" },
        { status: 500 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { ok: false, error: "Password required" },
        { status: 400 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { ok: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    const token = generateToken(password);

    const response = NextResponse.json({ ok: true });

    response.cookies.set("bandit-admin", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
