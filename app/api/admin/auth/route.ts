import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const TOKEN_SALT = process.env.TOKEN_SALT || "bandit-salt";

function generateToken(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + TOKEN_SALT)
    .digest("hex");
}

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get("bandit-admin");

    if (!cookie || !cookie.value) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const expectedToken = generateToken(ADMIN_PASSWORD);

    if (cookie.value !== expectedToken) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ ok: true });
    response.cookies.delete("bandit-admin");
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
