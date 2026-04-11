import { NextRequest } from "next/server";
import crypto from "crypto";

const TOKEN_SALT = process.env.TOKEN_SALT || "bandit-salt";

function generateToken(password: string): string {
  return crypto.createHash("sha256").update(password + TOKEN_SALT).digest("hex");
}

export function isAdminAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get("bandit-admin");
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!cookie?.value || !ADMIN_PASSWORD) return false;
  return cookie.value === generateToken(ADMIN_PASSWORD);
}
