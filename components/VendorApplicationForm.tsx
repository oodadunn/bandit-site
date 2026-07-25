"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

type VendorType = "service" | "wire" | "equipment" | "logistics";
type FormState = {
  company_name: string; contact_name: string; email: string; phone: string; website: string;
  address: string; city: string; state: string; zip: string; states: string; service_radius: string;
  years_experience: string; insurance_status: string; w9_ready: string; business_description: string;
};

const TYPES: { value: VendorType; label: string; description: string }[] = [
  { value: "service", label: "Service provider", description: "Repair, maintenance, installation" },
  { value: "wire", label: "Wire provider", description: "Manufacturing, supply, delivery" },
  { value: "equipment", label: "Equipment & parts", description: "Balers, components, consumables" },
  { value: "logistics", label: "Logistics", description: "Rigging, moving, freight" },
];

const CAPABILITIES: Record<VendorType, string[]> = {
  service: ["Emergency repair", "Preventive maintenance", "Installation", "Electrical / controls", "Hydraulics"],
  wire: ["Bale ties", "Box wire", "Black annealed", "Galvanized", "Customer delivery"],
  equipment: ["New equipment", "Used equipment", "Parts", "Leasing", "Consumables"],
  logistics: ["Rigging", "Equipment moving", "Flatbed freight", "Warehousing", "Last-mile delivery"],
};

const EMPTY: FormState = { company_name: "", contact_name: "", email: "", phone: "", website: "", address: "", city: "", state: "", zip: "", states: "", service_radius: "", years_experience: "", insurance_status: "", w9_ready: "", business_description: "" };

export default function VendorApplicationForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [types, setTypes] = useState<VendorType[]>([]);
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const visibleCapabilities = Array.from(new Set(types.flatMap((type) => CAPABILITIES[type])));

  const toggleType = (type: VendorType) => {
    setTypes((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]);
  };
  const toggleCapability = (capability: string) => setCapabilities((current) => current.includes(capability) ? current.filter((item) => item !== capability) : [...current, capability]);
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!types.length) { setStatus("error"); setError("Select at least one vendor type."); return; }
    setStatus("submitting"); setError("");
    try {
      const response = await fetch("/api/partner-application", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, vendor_types: types, capabilities }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Application could not be submitted.");
      setStatus("success");
    } catch (cause) { setStatus("error"); setError(cause instanceof Error ? cause.message : "Application could not be submitted."); }
  };

  if (status === "success") return <div className="card-dark text-center py-14"><CheckCircle size={48} className="text-[#39FF14] mx-auto mb-5" /><h2 className="text-2xl font-bold text-white mb-3">Application received.</h2><p className="text-gray-400 max-w-md mx-auto">We&apos;ll review your coverage and capabilities, then contact you using the information provided if there&apos;s a fit.</p></div>;

  return (
    <form onSubmit={submit} className="border border-white/10 rounded-xl bg-[#111] overflow-hidden">
      <FormSection number="01" title="What do you provide?">
        <div className="grid sm:grid-cols-2 gap-3">{TYPES.map((type) => <button type="button" key={type.value} onClick={() => toggleType(type.value)} className={`text-left p-4 rounded-lg border transition-colors ${types.includes(type.value) ? 'border-[#39FF14] bg-[#39FF14]/5' : 'border-white/10 hover:border-white/25'}`}><span className="flex items-center justify-between font-semibold text-white">{type.label}{types.includes(type.value) && <CheckCircle size={16} className="text-[#39FF14]" />}</span><span className="text-xs text-gray-500 mt-1 block">{type.description}</span></button>)}</div>
        {!!visibleCapabilities.length && <div className="mt-5"><p className="input-label">Capabilities <span className="text-gray-600">(select all that apply)</span></p><div className="flex flex-wrap gap-2">{visibleCapabilities.map((capability) => <button type="button" key={capability} onClick={() => toggleCapability(capability)} className={`px-3 py-2 rounded-md border text-xs ${capabilities.includes(capability) ? 'border-[#39FF14] text-[#39FF14] bg-[#39FF14]/5' : 'border-white/10 text-gray-400'}`}>{capability}</button>)}</div></div>}
      </FormSection>

      <FormSection number="02" title="Company & contact">
        <div className="grid sm:grid-cols-2 gap-4"><Input required label="Company name" value={form.company_name} onChange={(v) => update("company_name", v)} /><Input required label="Contact name" value={form.contact_name} onChange={(v) => update("contact_name", v)} /><Input required type="email" label="Work email" value={form.email} onChange={(v) => update("email", v)} /><Input required type="tel" label="Phone" value={form.phone} onChange={(v) => update("phone", v)} /><div className="sm:col-span-2"><Input type="url" label="Website (optional)" value={form.website} onChange={(v) => update("website", v)} placeholder="https://" /></div></div>
      </FormSection>

      <FormSection number="03" title="Location & coverage">
        <div className="space-y-4"><Input required label="Business address" value={form.address} onChange={(v) => update("address", v)} /><div className="grid sm:grid-cols-[1fr_100px_120px] gap-4"><Input required label="City" value={form.city} onChange={(v) => update("city", v)} /><Input required label="State" value={form.state} onChange={(v) => update("state", v)} placeholder="GA" /><Input required label="ZIP" value={form.zip} onChange={(v) => update("zip", v)} /></div><div className="grid sm:grid-cols-2 gap-4"><Input required label="States / areas served" value={form.states} onChange={(v) => update("states", v)} placeholder="GA, AL, TN" /><Input label="Typical service radius" value={form.service_radius} onChange={(v) => update("service_radius", v)} placeholder="150 miles" /></div></div>
      </FormSection>

      <FormSection number="04" title="Qualifications">
        <div className="grid sm:grid-cols-3 gap-4"><Select label="Years in business" value={form.years_experience} onChange={(v) => update("years_experience", v)} options={["Less than 3", "3-5", "6-10", "11-20", "20+"]} /><Select label="Commercial insurance" value={form.insurance_status} onChange={(v) => update("insurance_status", v)} options={["Current", "Can obtain", "Not currently"]} /><Select label="W-9 ready" value={form.w9_ready} onChange={(v) => update("w9_ready", v)} options={["Yes", "Need to prepare", "Not applicable"]} /></div><div className="mt-4"><label className="input-label">Anything else we should know?</label><textarea className="input-field min-h-28 resize-y" value={form.business_description} onChange={(e) => update("business_description", e.target.value)} placeholder="Brands supported, warehouse capacity, certifications, rate coverage, or other relevant details" /></div>
      </FormSection>

      <div className="p-6 sm:p-8 bg-[#0d0d0d] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div><p className="text-sm text-white font-medium">Ready to submit?</p><p className="text-xs text-gray-500 mt-1">Required fields are marked. No sensitive documents are needed yet.</p>{status === "error" && <p className="text-sm text-red-400 mt-2">{error}</p>}</div>
        <button disabled={status === "submitting"} className="btn-primary shrink-0">{status === "submitting" ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Submit vendor application"}</button>
      </div>
    </form>
  );
}

function FormSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) { return <section className="p-6 sm:p-8 border-b border-white/10"><div className="flex gap-3 items-baseline mb-6"><span className="text-xs font-mono text-[#39FF14]">{number}</span><h2 className="text-xl font-bold text-white">{title}</h2></div>{children}</section>; }
function Input({ label, value, onChange, required, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; placeholder?: string }) { return <div><label className="input-label">{label}{required ? " *" : ""}</label><input className="input-field" required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></div>; }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <div><label className="input-label">{label}</label><select className="input-field" value={value} onChange={(e) => onChange(e.target.value)}><option value="">Select...</option>{options.map((option) => <option key={option}>{option}</option>)}</select></div>; }
