"use client";
import { useState } from "react";
import { submitLead, type LeadFormType } from "@/lib/supabase";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import AddressAutofill from "./AddressAutofill";

const EQUIPMENT_TYPES = [
  "Vertical Baler",
  "Horizontal Baler",
  "Auto-Tie Baler",
  "Closed-Door Baler",
  "Two-Ram Baler",
  "Other / Not Sure",
];

interface QuoteFormProps {
  formType?: LeadFormType;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  showEquipment?: boolean;
  showUrgency?: boolean;
  compact?: boolean;
}

export default function QuoteForm({
  formType = "service_quote",
  title = "Get a Free Quote",
  subtitle = "We respond within 2 hours during business hours.",
  ctaLabel = "Request My Quote",
  showEquipment = true,
  showUrgency = false,
  compact = false,
}: QuoteFormProps) {
  const [form, setForm] = useState<{
    name: string; company: string; email: string; phone: string;
    address: string; state: string; city: string;
    equipment_type: string; issue_description: string;
    urgency: "emergency" | "urgent" | "standard";
  }>({
    name: "", company: "", email: "", phone: "",
    address: "", state: "", city: "",
    equipment_type: "", issue_description: "", urgency: "standard",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitLead({ ...form, form_type: formType });
      setStatus("success");
      // Also ping n8n webhook for lead routing
      fetch("/api/lead-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, form_type: formType }),
      }).catch(() => {}); // non-blocking
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please call us directly at 857-422-6348.");
    }
  };

  if (status === "success") {
    return (
      <div className="card-dark text-center py-12">
        <CheckCircle className="mx-auto text-[#39FF14] mb-4" size={48} />
        <h3 className="text-xl font-bold text-white mb-2">Quote Request Received!</h3>
        <p className="text-gray-400 text-sm">
          We&apos;ll contact you within 2 hours. For emergencies, call{" "}
          <a href="tel:+18574226348" className="text-[#39FF14] hover:underline font-mono">
            857-422-6348
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "card-dark"}>
      {!compact && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={compact ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
          <div>
            <label className="input-label">Name *</label>
            <input name="name" required value={form.name} onChange={handleChange}
              placeholder="John Smith" className="input-field" />
          </div>
          <div>
            <label className="input-label">Company *</label>
            <input name="company" required value={form.company} onChange={handleChange}
              placeholder="ABC Distribution" className="input-field" />
          </div>
          <div>
            <label className="input-label">Phone *</label>
            <input name="phone" required type="tel" value={form.phone} onChange={handleChange}
              placeholder="(555) 000-0000" className="input-field" />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="john@company.com" className="input-field" />
          </div>
          <div className={compact ? "sm:col-span-2" : ""}>
            <label className="input-label">Service Address *</label>
            <AddressAutofill
              value={form.address}
              onChange={(val) => setForm((prev) => ({ ...prev, address: val }))}
              onSelect={(parts) =>
                setForm((prev) => ({
                  ...prev,
                  address: parts.full_address,
                  state: parts.state,
                  city: parts.city,
                }))
              }
              required
              placeholder="123 Main St, City, State..."
            />
          </div>
          {showEquipment && (
            <div>
              <label className="input-label">Equipment Type</label>
              <select name="equipment_type" value={form.equipment_type} onChange={handleChange} className="input-field">
                <option value="">Select type...</option>
                {EQUIPMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="input-label">
            {formType === "emergency" ? "Describe the issue *" : "What do you need help with?"}
          </label>
          <textarea name="issue_description" value={form.issue_description} onChange={handleChange}
            rows={3} placeholder="Describe your equipment issue or what you need..."
            className="input-field resize-none" />
        </div>

        {showUrgency && (
          <div>
            <label className="input-label">Urgency</label>
            <select name="urgency" value={form.urgency} onChange={handleChange} className="input-field">
              <option value="standard">Standard — within 48 hours</option>
              <option value="urgent">Urgent — within 24 hours</option>
              <option value="emergency">Emergency — ASAP</option>
            </select>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-800/40 rounded-lg">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-300">{errorMsg}</p>
          </div>
        )}

        <button type="submit" disabled={status === "loading"}
          className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed">
          {status === "loading" ? (
            <><Loader2 size={16} className="animate-spin" /> Sending...</>
          ) : ctaLabel}
        </button>

        <p className="text-xs text-center text-gray-600">
          No spam. We only contact you about your request.
        </p>
      </form>
    </div>
  );
}
