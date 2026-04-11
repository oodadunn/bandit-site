import { getSupabaseAdmin } from "./supabase-admin";
import type { Lead } from "./supabase";

// ============================================================
// Types — mirror the public.* CRM tables
// ============================================================

export type AccountType = "prospect" | "customer" | "partner" | "vendor" | "lost";
export type AccountTier = "A" | "B" | "C" | "D";

export interface Account {
  id: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  domain?: string | null;
  industry?: string | null;
  account_type?: AccountType | null;
  tier?: AccountTier | null;
  billing_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  primary_phone?: string | null;
  website?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  owner_email?: string | null;
  source?: string | null;
  ga_campaign?: string | null;
  ga_source?: string | null;
  ga_medium?: string | null;
  first_touch_at?: string | null;
  last_activity_at?: string | null;
}

export interface Contact {
  id: string;
  created_at?: string;
  account_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  is_primary?: boolean | null;
  notes?: string | null;
}

export type BalerType = "vertical" | "horizontal" | "other";
export type EquipmentStatus = "active" | "idle" | "needs_service" | "decommissioned";

export interface Equipment {
  id: string;
  created_at?: string;
  account_id?: string | null;
  make?: string | null;
  model?: string | null;
  serial_number?: string | null;
  baler_type?: BalerType | null;
  capacity_tons?: number | null;
  year?: number | null;
  install_date?: string | null;
  location_label?: string | null;
  city?: string | null;
  state?: string | null;
  status?: EquipmentStatus | null;
  warranty_expires?: string | null;
  next_pm_due?: string | null;
  notes?: string | null;
}

export type DealType =
  | "repair"
  | "maintenance_contract"
  | "equipment_sale"
  | "equipment_lease"
  | "wire"
  | "install"
  | "move"
  | "other";

export type DealStage =
  | "new"
  | "qualified"
  | "site_survey"
  | "quoted"
  | "negotiation"
  | "won"
  | "lost"
  | "on_hold";

export interface Deal {
  id: string;
  created_at?: string;
  account_id?: string | null;
  contact_id?: string | null;
  lead_id?: string | null;
  equipment_id?: string | null;
  name: string;
  deal_type?: DealType | null;
  stage?: DealStage | null;
  amount_usd?: number | null;
  probability?: number | null;
  close_date?: string | null;
  notes?: string | null;
}

// ============================================================
// Helpers
// ============================================================

function emailDomain(email?: string | null): string | null {
  if (!email) return null;
  const at = email.indexOf("@");
  if (at < 0) return null;
  return email.slice(at + 1).toLowerCase().trim() || null;
}

function splitName(name?: string | null): { first: string | null; last: string | null } {
  if (!name) return { first: null, last: null };
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: null };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function dealTypeForForm(formType?: string | null): DealType {
  switch (formType) {
    case "service_quote":
    case "emergency":
      return "repair";
    case "maintenance":
      return "maintenance_contract";
    case "wire_quote":
      return "wire";
    case "equipment":
      return "equipment_sale";
    default:
      return "other";
  }
}

function dealNameForLead(lead: Lead): string {
  const company = lead.company || lead.name || "Unknown";
  switch (lead.form_type) {
    case "service_quote":
      return `${company} — Service quote`;
    case "emergency":
      return `${company} — Emergency repair`;
    case "maintenance":
      return `${company} — Maintenance plan`;
    case "wire_quote":
      return `${company} — Bale wire`;
    case "equipment":
      return `${company} — Equipment ${lead.product_type || "purchase"}`;
    default:
      return `${company} — Inquiry`;
  }
}

// ============================================================
// Convert a freshly-saved lead into Account + Contact + Deal
// Idempotent-ish: dedupes by company name (case-insensitive) or
// by email domain. Safe to call multiple times for the same lead —
// it will skip work if the lead already has a deal_id set.
// ============================================================

export interface ConvertResult {
  account_id: string;
  contact_id: string | null;
  deal_id: string | null;
  account_created: boolean;
  contact_created: boolean;
}

export async function convertLeadToAccount(lead: Lead & { id: string }): Promise<ConvertResult> {
  const sb = getSupabaseAdmin();
  const isPartner = lead.form_type === "partner";

  // Skip if already converted (partners have no deal, so only check account)
  const { data: existingLead } = await sb
    .from("leads")
    .select("account_id, contact_id, deal_id")
    .eq("id", lead.id)
    .single();

  if (existingLead?.account_id && (isPartner || existingLead.deal_id)) {
    return {
      account_id: existingLead.account_id as string,
      contact_id: (existingLead.contact_id as string) || null,
      deal_id: (existingLead.deal_id as string) || null,
      account_created: false,
      contact_created: false,
    };
  }

  // ---------- 1. Find or create account ----------
  let account: Account | null = null;
  const companyName = (lead.company || "").trim();
  const domain = emailDomain(lead.email);

  if (companyName) {
    const { data } = await sb
      .from("accounts")
      .select("*")
      .ilike("name", companyName)
      .limit(1)
      .maybeSingle();
    if (data) account = data as Account;
  }

  if (!account && domain) {
    const { data } = await sb
      .from("accounts")
      .select("*")
      .eq("domain", domain)
      .limit(1)
      .maybeSingle();
    if (data) account = data as Account;
  }

  let accountCreated = false;
  if (!account) {
    const insertName =
      companyName || (lead.name ? `${lead.name} (individual)` : "Unknown account");
    const { data, error } = await sb
      .from("accounts")
      .insert({
        name: insertName,
        domain: domain,
        primary_phone: lead.phone,
        billing_address: lead.address,
        city: lead.city,
        state: lead.state,
        account_type: isPartner ? "partner" : "prospect",
        source: isPartner ? "partner_application" : "website_lead",
        notes: isPartner ? lead.issue_description || null : null,
        first_touch_at: lead.created_at || new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (error) throw error;
    account = data as Account;
    accountCreated = true;
  } else {
    // Touch last_activity_at + backfill any blanks
    await sb
      .from("accounts")
      .update({
        last_activity_at: new Date().toISOString(),
        primary_phone: account.primary_phone || lead.phone,
        city: account.city || lead.city,
        state: account.state || lead.state,
        billing_address: account.billing_address || lead.address,
      })
      .eq("id", account.id);
  }

  // ---------- 2. Find or create contact ----------
  let contact: Contact | null = null;
  let contactCreated = false;

  if (lead.email) {
    const { data } = await sb
      .from("contacts")
      .select("*")
      .ilike("email", lead.email)
      .limit(1)
      .maybeSingle();
    if (data) contact = data as Contact;
  }
  if (!contact && lead.phone) {
    const { data } = await sb
      .from("contacts")
      .select("*")
      .eq("phone", lead.phone)
      .limit(1)
      .maybeSingle();
    if (data) contact = data as Contact;
  }

  if (!contact && (lead.name || lead.email || lead.phone)) {
    const { first, last } = splitName(lead.name);
    const { data, error } = await sb
      .from("contacts")
      .insert({
        account_id: account.id,
        first_name: first,
        last_name: last,
        full_name: lead.name,
        email: lead.email,
        phone: lead.phone,
        is_primary: true,
      })
      .select("*")
      .single();
    if (error) throw error;
    contact = data as Contact;
    contactCreated = true;
  } else if (contact && !contact.account_id) {
    await sb.from("contacts").update({ account_id: account.id }).eq("id", contact.id);
  }

  // ---------- 3. Create deal (skipped for partner applications) ----------
  let dealId: string | null = null;
  if (!isPartner) {
    const { data: dealRow, error: dealErr } = await sb
      .from("deals")
      .insert({
        account_id: account.id,
        contact_id: contact?.id ?? null,
        lead_id: lead.id,
        name: dealNameForLead(lead),
        deal_type: dealTypeForForm(lead.form_type),
        stage: "new",
        probability: lead.urgency === "emergency" ? 60 : 25,
        source: lead.form_type,
        notes: lead.issue_description || null,
      })
      .select("id")
      .single();
    if (dealErr) throw dealErr;
    dealId = (dealRow as { id: string }).id;
  }

  // ---------- 4. Backlink the lead ----------
  await sb
    .from("leads")
    .update({
      account_id: account.id,
      contact_id: contact?.id ?? null,
      deal_id: dealId,
      converted_at: new Date().toISOString(),
    })
    .eq("id", lead.id);

  // ---------- 5. Activity log ----------
  const activityNote = isPartner
    ? `Partner application received → ${accountCreated ? "new" : "existing"} partner account "${account.name}"`
    : accountCreated
    ? `Auto-converted lead → new account "${account.name}"`
    : `Auto-converted lead → existing account "${account.name}"`;
  await sb.from("lead_activity").insert({
    lead_id: lead.id,
    account_id: account.id,
    deal_id: dealId,
    activity_type: "created",
    notes: activityNote,
    performed_by: "system",
  });

  return {
    account_id: account.id,
    contact_id: contact?.id ?? null,
    deal_id: dealId,
    account_created: accountCreated,
    contact_created: contactCreated,
  };
}
