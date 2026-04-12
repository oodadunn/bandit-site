/**
 * GA4 Data API client — zero external dependencies.
 *
 * Uses a Google Cloud service account (JSON key stored as base64 in
 * GA4_SERVICE_ACCOUNT_BASE64 env var) and the numeric GA4 property ID
 * (GA4_PROPERTY_ID env var) to call the Analytics Data API v1beta.
 *
 * Auth flow: craft a JWT → sign with RS256 → exchange for access token → call API.
 */

import crypto from "crypto";

// ── Types ──────────────────────────────────────────────────────────────
interface ServiceAccount {
  client_email: string;
  private_key: string;
}

export interface GA4DailyRow {
  date: string; // YYYY-MM-DD
  sessions: number;
  page_views: number;
  users: number;
  bounce_rate: number;
  avg_session_duration: number;
  top_pages: Record<string, number>;
  traffic_sources: Record<string, number>;
}

// ── Helpers ────────────────────────────────────────────────────────────

function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64url");
}

function getServiceAccount(): ServiceAccount {
  const raw = process.env.GA4_SERVICE_ACCOUNT_BASE64;
  if (!raw) throw new Error("GA4_SERVICE_ACCOUNT_BASE64 env var not set");
  return JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
}

function getPropertyId(): string {
  const id = process.env.GA4_PROPERTY_ID;
  if (!id) throw new Error("GA4_PROPERTY_ID env var not set");
  return id;
}

// ── JWT + Access Token ─────────────────────────────────────────────────

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const sa = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );

  const signable = `${header}.${payload}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(signable)
    .sign(sa.private_key);
  const jwt = `${signable}.${base64url(signature)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

// ── GA4 Data API ───────────────────────────────────────────────────────

const DATA_API = "https://analyticsdata.googleapis.com/v1beta";

async function runReport(body: object): Promise<any> {
  const token = await getAccessToken();
  const propertyId = getPropertyId();
  const res = await fetch(
    `${DATA_API}/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GA4 runReport failed (${res.status}): ${text}`);
  }
  return res.json();
}

/**
 * Fetch daily metrics + top pages + traffic sources for the given date range.
 */
export async function fetchGA4Data(
  startDate: string,
  endDate: string
): Promise<GA4DailyRow[]> {
  // 1) Daily overview metrics
  const overviewReport = await runReport({
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "date" }],
    metrics: [
      { name: "sessions" },
      { name: "screenPageViews" },
      { name: "activeUsers" },
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
    ],
  });

  // 2) Top pages by date
  const pagesReport = await runReport({
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "date" }, { name: "pagePathPlusQueryString" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [
      { dimension: { dimensionName: "date" } },
      { metric: { metricName: "screenPageViews" }, desc: true },
    ],
    limit: 500,
  });

  // 3) Traffic sources by date
  const sourcesReport = await runReport({
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: "date" },
      { name: "sessionDefaultChannelGroup" },
    ],
    metrics: [{ name: "sessions" }],
    limit: 500,
  });

  // ── Assemble per-day rows ──────────────────────────────────────────
  const dayMap = new Map<string, GA4DailyRow>();

  // Parse overview
  for (const row of overviewReport.rows || []) {
    const rawDate = row.dimensionValues[0].value; // "20260411"
    const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
    dayMap.set(date, {
      date,
      sessions: parseInt(row.metricValues[0].value) || 0,
      page_views: parseInt(row.metricValues[1].value) || 0,
      users: parseInt(row.metricValues[2].value) || 0,
      bounce_rate: parseFloat(row.metricValues[3].value) || 0,
      avg_session_duration: parseFloat(row.metricValues[4].value) || 0,
      top_pages: {},
      traffic_sources: {},
    });
  }

  // Parse pages
  for (const row of pagesReport.rows || []) {
    const rawDate = row.dimensionValues[0].value;
    const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
    const page = row.dimensionValues[1].value;
    const views = parseInt(row.metricValues[0].value) || 0;
    const day = dayMap.get(date);
    if (day) {
      day.top_pages[page] = (day.top_pages[page] || 0) + views;
    }
  }

  // Parse sources
  for (const row of sourcesReport.rows || []) {
    const rawDate = row.dimensionValues[0].value;
    const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
    const source = row.dimensionValues[1].value;
    const sessions = parseInt(row.metricValues[0].value) || 0;
    const day = dayMap.get(date);
    if (day) {
      day.traffic_sources[source] = (day.traffic_sources[source] || 0) + sessions;
    }
  }

  // Sort descending by date
  return Array.from(dayMap.values()).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}
