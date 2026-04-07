import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types matching our database schema
export type LeadFormType =
  | "service_quote"
  | "emergency"
  | "maintenance"
  | "wire_quote"
  | "equipment";

export interface Lead {
  id?: string;
  created_at?: string;
  form_type: LeadFormType;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  equipment_type?: string;
  issue_description?: string;
  urgency?: "emergency" | "urgent" | "standard";
  quantity?: string;
  product_type?: string;
  budget_range?: string;
  status?: string;
}

export interface SiteStat {
  stat_key: string;
  stat_value: number;
  display_label: string;
}

export interface ServiceArea {
  id: string;
  state: string;
  state_code: string;
  cities: string[];
  local_phone?: string;
  h1?: string;
  body_content?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface EquipmentListing {
  id: string;
  make: string;
  model: string;
  baler_type: "vertical" | "horizontal" | "other";
  condition: "new" | "used" | "refurbished";
  capacity_tons?: number;
  year?: number;
  price_usd?: number;
  available: boolean;
  listing_type: "sale" | "lease" | "both";
  lease_monthly_usd?: number;
  description?: string;
  images?: string[];
  location_state?: string;
}

// Submit a lead from any form
export async function submitLead(lead: Lead) {
  const { data, error } = await supabase
    .from("leads")
    .insert(lead)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

// Get site stats for homepage
export async function getSiteStats(): Promise<SiteStat[]> {
  const { data, error } = await supabase.from("site_stats").select("*");
  if (error) throw error;
  return data ?? [];
}

// Get all active service areas
export async function getServiceAreas(): Promise<ServiceArea[]> {
  const { data, error } = await supabase
    .from("service_areas")
    .select("*")
    .eq("active", true)
    .order("state");
  if (error) throw error;
  return data ?? [];
}

// Get available equipment listings
export async function getEquipmentListings(): Promise<EquipmentListing[]> {
  const { data, error } = await supabase
    .from("equipment_listings")
    .select("*")
    .eq("available", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
