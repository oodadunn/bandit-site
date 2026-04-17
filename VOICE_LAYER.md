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

ALWAYS, within your first response after the caller speaks, call the
`caller_lookup` tool with the caller's phone number so you have their history.

ROUTING:
- Sales / new quote / equipment / leasing → transfer to Savannah.
- Service request, broken equipment, pickup → call `create_service_ticket`
  yourself (you can do this without transferring) and confirm the ETA.
- Billing / invoice / payment → transfer to Nova.
- Angry, asking for a human, mentions "lawsuit" or "cancel" → call
  `create_escalation` with urgency=high and stay with them calmly until
  you've confirmed the callback.

If the caller can't stay on the line, call `schedule_callback`.

NEVER invent prices. If unsure, book a callback or transfer.
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
