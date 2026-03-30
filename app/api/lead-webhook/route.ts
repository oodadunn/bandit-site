import { NextRequest, NextResponse } from "next/server";

// This route forwards lead submissions to the n8n webhook for HubSpot routing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const n8nWebhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      // If n8n webhook not configured yet, just return success
      // The lead is already saved to Supabase from the client
      return NextResponse.json({ ok: true, routed: false });
    }

    const res = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        source: "banditrecycling.com",
        timestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      console.error("n8n webhook failed:", res.status);
      return NextResponse.json({ ok: true, routed: false });
    }

    return NextResponse.json({ ok: true, routed: true });
  } catch (err) {
    console.error("Lead webhook error:", err);
    return NextResponse.json({ ok: true, routed: false });
  }
}
