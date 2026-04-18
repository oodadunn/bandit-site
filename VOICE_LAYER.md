# Bandit Voice Layer — ElevenLabs Conversational AI + Tool Endpoints

## Architecture

```
Caller dials (857) 422-6348
        │
        ▼
 Twilio PSTN  (webhook: api.us.elevenlabs.io/twilio/inbound_call)
        │
        ▼
 ElevenLabs Conversational AI        <-- owns ASR + LLM + TTS, real-time
        │
        ├── mid-call tool calls (HTTPS to banditrecycling.com/api/voice/tools/*)
        │     • caller-lookup        → CRM context
        │     • create-escalation    → flag call, notify owner via n8n
        │     • schedule-callback    → lead row with form_type='voice_callback'
        │     • create-service-ticket→ lead row with form_type='service_request'
        │
        └── call end → post-call webhook → banditrecycling.com/api/voice/postcall
              └── upserts calls + call_turns in Supabase
                    └── shows up in /admin Calls tab
```

## Files

| File                                                          | Role                                            |
| ------------------------------------------------------------- | ----------------------------------------------- |
| `supabase/migrations/20260417_voice_layer.sql`                | `calls`, `call_turns`, `voice_tool_log`, agents extensions |
| `lib/voice-tools.ts`                                          | auth check, phone normalize, tool-log helper    |
| `app/api/voice/tools/caller-lookup/route.ts`                  | CRM context by caller phone                     |
| `app/api/voice/tools/create-escalation/route.ts`              | Flag the call for human follow-up               |
| `app/api/voice/tools/schedule-callback/route.ts`              | Book a callback (writes to leads)               |
| `app/api/voice/tools/create-service-ticket/route.ts`          | Open a service ticket (writes to leads)         |
| `app/api/voice/postcall/route.ts`                             | EL post-call webhook — upserts call + transcript|
| `app/api/admin/calls/route.ts`                                | /admin Calls tab feed                           |

## Env vars (Vercel)

| Var                          | Required | Notes                                       |
| ---------------------------- | -------- | ------------------------------------------- |
| `VOICE_TOOL_SECRET`          | yes      | random string; goes into EL tool config's `x-voice-tool-secret` header |
| `ELEVENLABS_WEBHOOK_SECRET`  | yes      | shown in EL agent → Webhooks config; we HMAC-verify every post-call request |
| `SUPABASE_SERVICE_ROLE_KEY`  | yes      | already set                                 |
| `NEXT_PUBLIC_SUPABASE_URL`   | yes      | already set                                 |
| `NEXT_PUBLIC_SITE_URL`       | yes      | `https://banditrecycling.com`               |

## ElevenLabs dashboard setup

### Step 1: Create (or reuse) one agent per role

In EL dashboard → **Conversational AI → Agents**, you want an agent per named persona.
Start with **Jade** (the receptionist) and add Savannah / Rex / Nova / etc. as needed.

For each agent:

- **Voice**: pick from the EL voice library or clone a custom voice.
- **LLM**: gpt-4o-mini (matches our n8n stack; cheapest per token).
- **First message**: the greeting (e.g., Jade: *"Thanks for calling Bandit Recycling, this is Jade. How can I help?"*).
- **System prompt**: see templates in Appendix A.
- **Language**: English (US).
- **Latency mode**: lowest available (the point of this stack).

Then, in Supabase, map each EL agent to its internal name:

```sql
UPDATE agents SET elevenlabs_agent_id = '<paste from EL dashboard>' WHERE name = 'jade';
UPDATE agents SET elevenlabs_agent_id = '<...>' WHERE name = 'savannah';
-- repeat for rex, diesel, nova, scout, atlas
```

Without that mapping, the post-call webhook will still log the call but `current_agent` stays null.

### Step 2: Register the four tools on each agent

For every agent, under **Tools → Add tool → Webhook**, paste:

#### Tool 1 — caller_lookup

```
Name:          caller_lookup
Description:   Get CRM info about the caller by phone number — account, contact, open deals, last service date. Call this once near the start of every conversation.
URL:           https://banditrecycling.com/api/voice/tools/caller-lookup
Method:        POST
Headers:       x-voice-tool-secret: <VOICE_TOOL_SECRET>
Body schema:
  {
    "phone": { "type": "string", "description": "Caller's phone in E.164 or raw — we normalize it." }
  }
```

#### Tool 2 — create_escalation

```
Name:          create_escalation
Description:   Flag this call for human follow-up. Use when the caller is upset, asks for a human, or raises something you can't handle safely (legal, refund, cancellation threat).
URL:           https://banditrecycling.com/api/voice/tools/create-escalation
Method:        POST
Headers:       x-voice-tool-secret: <VOICE_TOOL_SECRET>
Body schema:
  {
    "reason":   { "type": "string", "description": "One-sentence summary of why we're escalating." },
    "urgency":  { "type": "string", "enum": ["low","medium","high","emergency"], "description": "How fast someone needs to respond." },
    "notes":    { "type": "string", "description": "Any extra detail for the human who takes this over." }
  }
Required: reason
```

#### Tool 3 — schedule_callback

```
Name:          schedule_callback
Description:   Book a callback when the caller can't stay on the line or needs a specialist we don't have live. Creates a lead with form_type=voice_callback.
URL:           https://banditrecycling.com/api/voice/tools/schedule-callback
Method:        POST
Headers:       x-voice-tool-secret: <VOICE_TOOL_SECRET>
Body schema:
  {
    "phone":             { "type": "string" },
    "name":              { "type": "string" },
    "company":           { "type": "string" },
    "preferred_window":  { "type": "string", "description": "Free text — 'tomorrow morning', 'after 3pm', etc." },
    "topic":             { "type": "string", "description": "What the callback is about." },
    "target_agent":      { "type": "string", "enum": ["savannah","rex","diesel","nova","scout"], "description": "Who should call them back." },
    "urgency":           { "type": "string", "enum": ["emergency","urgent","standard"] }
  }
Required: phone, topic
```

#### Tool 4 — create_service_ticket

```
Name:          create_service_ticket
Description:   Open a service ticket for a broken baler, repair visit, pickup request, or installation. Writes to the leads table with form_type=service_request.
URL:           https://banditrecycling.com/api/voice/tools/create-service-ticket
Method:        POST
Headers:       x-voice-tool-secret: <VOICE_TOOL_SECRET>
Body schema:
  {
    "phone":              { "type": "string" },
    "name":               { "type": "string" },
    "company":            { "type": "string" },
    "equipment_type":     { "type": "string", "description": "'vertical baler' | 'horizontal baler' | 'compactor' | other" },
    "issue_description":  { "type": "string" },
    "urgency":            { "type": "string", "enum": ["emergency","urgent","standard"] },
    "site_address":       { "type": "string" },
    "service_type":       { "type": "string", "enum": ["repair","pickup","installation","maintenance","relocation"] }
  }
Required: phone, issue_description
```

> **Note**: ElevenLabs automatically forwards `conversation_id`, `agent_id`, and `caller_number` in the tool-call body — we parse those in `parseCallContext()`. You don't need to add them to the schema.

### Step 3: Configure the post-call webhook

For each agent, under **Webhooks** (or **Integrations → Post-call webhook**):

```
URL:     https://banditrecycling.com/api/voice/postcall
Method:  POST
Events:  post_call_transcription
Secret:  <ELEVENLABS_WEBHOOK_SECRET>   ← EL generates; paste same value into Vercel env
```

The signature lives in the `ElevenLabs-Signature` header; we HMAC-verify it on arrival.

### Step 4: (Optional) Agent transfer between EL agents

If you want Jade to hand off to Savannah mid-call:

- EL supports `transfer_to_agent` as a built-in tool or through an agent-transfer
  block in the prompt. Enable it per agent.
- List the target agents Jade can transfer to in her prompt: *"If the caller
  wants a quote or new equipment, transfer to Savannah. If they need service,
  transfer to Rex. …"*
- Transfers keep conversation context inside EL; on our side, the post-call
  webhook arrives with whichever agent was speaking at the end — the
  transcript still contains the full multi-agent exchange.

## Twilio config (no change needed)

Leave the Twilio number pointing at ElevenLabs:

```
A CALL COMES IN:      https://api.us.elevenlabs.io/twilio/inbound_call
CALL STATUS CHANGES:  https://api.us.elevenlabs.io/twilio/status-callback
```

EL handles the SIP/media relay and calls our tools/webhooks itself.

## Appendix A — Agent system prompts

Short, opinionated starters. Iterate in EL's prompt tester.

### Jade (main line receptionist)

```
You are Jade, the voice of Bandit Recycling — a nationwide recycling partner
serving grocery, distribution, and industrial customers. You answer the main
line. Your job is to greet callers warmly, figure out what they need, and
either handle it yourself or transfer to the right specialist.

STYLE: Warm, efficient, never stiff. Keep replies under 25 words. This is a
phone call — short is kind. Never list options numerically; offer in prose.
Do NOT emit stage-direction tags like [happy], [excited], [sad] — those get
spoken out loud on our voice model. Convey emotion with word choice only.

LATENCY: Respond immediately. Don't think out loud. Greet first, then call
tools in the background — never make the caller wait in silence while a
tool runs. If a tool takes a moment, say "one sec, pulling that up" and
keep talking.

RESPONSE-TIME PROMISES — IMPORTANT:
Do NOT promise specific time windows. We do not guarantee "same-day",
"2-hour", "24-hour", or any other dispatch/response SLA on this call.
Instead say things like: "we'll respond as quickly as we can", "I'll
escalate this immediately — it's treated as an emergency", "a dispatcher
will follow up as soon as they can". Emergencies get escalated first;
non-emergencies go in the queue. Never invent an ETA.

Call the `caller_lookup` tool early (ideally right after your greeting) to
pull the caller's CRM history — but do it in the background while you're
talking, not as a blocking pause.

ROUTING:
- Sales / new quote / equipment / leasing → transfer to Savannah.
- Service request, broken equipment, pickup → call `create_service_ticket`
  yourself (you can do this without transferring) and read back the
  priority message the tool returns.
- Billing / invoice / payment → transfer to Nova.
- Angry, asking for a human, mentions "lawsuit" or "cancel" → call
  `create_escalation` with urgency=high and stay with them calmly until
  you've confirmed the callback.

If the caller can't stay on the line, call `schedule_callback`.

NEVER invent prices. NEVER invent response times. If unsure, book a
callback or transfer.
```

### Savannah (sales & onboarding)

```
You are Savannah, Bandit's sales agent. Warm, consultative, knowledgeable
about baler leasing and bale wire supply. You already have the caller's CRM
context from the transfer.

Guide the conversation: confirm the facility type, current equipment,
monthly bale count if known, and decision timeline. Don't over-quote —
offer a ballpark range only if you're confident; otherwise book a site
survey via `schedule_callback` with topic="site survey" and target_agent="rex".

Always close by either (a) scheduling the next step or (b) escalating to a
human if the deal is >$10k/month or the facility is a multi-site chain.
```

### Rex (ops & dispatch)

```
You are Rex, Bandit's dispatch and operations agent. Direct, fast, no small
talk. You handle service calls: broken balers, pickup requests, trailer
rentals, maintenance visits.

STYLE: Reply in under 20 words. Don't narrate what you're doing. No stage
directions in brackets ([happy], [sad], etc.) — those are not emotions, they
are tokens our voice will say out loud. Convey urgency through words only.

RESPONSE-TIME PROMISES — IMPORTANT:
Do NOT promise specific timeframes ("same-day", "within 2 hours", "within
24 hours", etc.). We do not guarantee response windows. Emergencies are
escalated first; non-emergencies go in the queue. Say things like "I'm
escalating this as an emergency — a dispatcher will be in touch as fast as
we can", or "I've got this in the queue and a dispatcher will follow up as
soon as they can." Read back the `acknowledged_message` the tool returns —
it's pre-written to avoid SLA promises.

For every service caller, use `create_service_ticket`. Confirm address,
equipment, and whether the baler is currently down. Emergency = baler is
dead and blocking production; urgent = degraded but running; standard =
scheduled maintenance.

If the caller is a new prospect asking about service, still create the
ticket — we'll earn them by showing up fast.
```

### Nova (billing)

```
You are Nova, Bandit's billing agent. Calm, patient, precise. You handle
invoice questions, payment status, credits, and disputes.

You do NOT have live billing system access yet. For any actual account
balance or payment question, call `schedule_callback` with
target_agent="nova" and topic="billing — [what they asked]" so a human can
pull the Xero record and call back. For disputes or delinquency, call
`create_escalation` with urgency=medium.
```

## Latency budget

- EL ASR + LLM + TTS combined: **~900-1300ms first syllable**.
- Our tool endpoints: **~200-400ms** round-trip (Supabase query + return).
- Tool calls don't block the voice stream — EL speaks a brief "let me look that up" while the tool runs.

## Latency tuning checklist (ElevenLabs dashboard)

If the agent feels slow to respond after the caller stops talking, work down
this list in the EL agent config. Each lever below is approximately ranked by
impact on perceived latency (the gap between "caller stops talking" and
"agent starts speaking").

1. **LLM choice — biggest lever.** Switch to the fastest model available for
   your account: in order of time-to-first-token, typically
   `gemini-2.5-flash` or `gpt-4.1-nano` > `gpt-4o-mini` > `gpt-4.1-mini`.
   Our current stack (`gpt-4o-mini`) is fine but slower than Gemini Flash
   for voice. Swap and A/B test on Jade first.

2. **TTS model — use Flash v2.5.** In voice settings, pick `eleven_flash_v2_5`
   (≈75ms first audio) instead of Turbo v2.5 (≈250ms) or Multilingual v2
   (≈400ms+). Flash is purpose-built for conversational AI latency.

3. **Turn-detection end-of-speech timeout.** Default is ~800ms of silence
   before the agent decides the caller is done. Lower to **400–600ms** for
   snappier turn-taking. Any lower risks cutting callers off mid-thought.

4. **Shorten the system prompt.** Longer prompts increase time-to-first-token
   on every turn. Our Jade/Rex prompts are already tight, but avoid bloat.

5. **Cap `max_tokens` on the LLM response.** Set to ~120 tokens. Phone replies
   should be short; long generations increase TTS-synthesis time before the
   first audio plays.

6. **Enable streaming TTS & optimize-streaming-latency.** EL exposes a
   streaming latency optimizer (1–4). Set to `3` or `4` for voice (higher =
   more aggressive, slightly lower quality). Values of `0`/`1` are for
   offline-quality synthesis.

7. **Parallel tool calls.** Jade's prompt now says to call `caller_lookup` in
   the background (not block on it). Make sure the EL agent's tool config
   has "async execution" or equivalent so the greeting streams while the
   lookup happens.

8. **Warm-up the Vercel edge.** Tool endpoints are `runtime = "nodejs"`.
   Cold starts can add ~500ms on a first hit. Consider keeping one warm
   request/minute from a cron, or moving the hottest tools (caller-lookup)
   to edge runtime.

9. **Drop the "let me look that up" filler** once tool calls are parallelized.
   If `caller_lookup` runs in the background, we don't need to stall.

10. **Baseline measurement.** EL exposes per-turn latency in the call
    analytics panel. Capture a baseline before changing anything — otherwise
    you're optimizing by vibe.

Our current `gpt-4o-mini` + Turbo setup should sit around **800–1200ms**
caller-to-agent gap. Gemini Flash + Flash v2.5 TTS + 500ms turn-detection
should bring that to **500–800ms**, which feels noticeably more natural.

## Testing

1. Run the SQL migration.
2. Add `VOICE_TOOL_SECRET` and `ELEVENLABS_WEBHOOK_SECRET` to Vercel.
3. Push the code (Vercel builds ~1 min).
4. Configure the four tools + post-call webhook on the Jade EL agent.
5. Call (857) 422-6348. Say "Hi, I need to repair my baler." Jade should
   call `caller_lookup`, then `create_service_ticket`.
6. Check `/admin → Calls` — the call row, transcript, and linked lead
   should all appear within ~10s of hangup.
7. Inspect `voice_tool_log` in Supabase for per-tool audit trail.
