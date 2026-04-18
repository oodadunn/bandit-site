"use client";
import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  MapPin,
  Wrench,
  DoorOpen,
  Ruler,
  Zap,
  Truck,
  User,
  ShieldAlert,
  Camera,
  CheckCircle,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Info,
} from "lucide-react";
import AddressAutofill from "@/components/AddressAutofill";
import PhotoUpload from "@/components/PhotoUpload";

/* ─── Types ─────────────────────────────────────────────── */

interface SurveyForm {
  // Service info
  service_type: string;
  equipment_type: string;
  work_description: string;

  // Requestor
  requestor_name: string;
  requestor_email: string;
  requestor_phone: string;
  requestor_company: string;

  // On-site contact
  onsite_contact_name: string;
  onsite_contact_phone: string;
  onsite_contact_role: string;
  same_as_requestor: boolean;

  // Address
  site_address: string;
  site_city: string;
  site_state: string;
  site_zip: string;

  // Site access
  gate_or_security: boolean;
  gate_details: string;
  dock_access: boolean;
  dock_details: string;
  floor_level: string;
  elevator_available: boolean;

  // Choke points
  choke_width_inches: string;
  choke_height_inches: string;
  ceiling_height_feet: string;
  path_description: string;

  // Electrical
  electrical_voltage: string;
  electrical_phase: string;
  electrical_amperage: string;
  disconnect_in_place: boolean;
  electrical_distance_ft: string;
  electrical_notes: string;

  // On-site equipment
  forklift_available: boolean;
  forklift_capacity_lbs: string;
  other_equipment: string;

  // Scheduling
  preferred_date: string;
  preferred_time_window: string;

  // Special
  special_instructions: string;
  hazardous_materials: boolean;
  hazmat_details: string;

  // Photos
  photos_equipment: string[];
  photos_access: string[];
  photos_electrical: string[];
  photos_facility: string[];

  // Acknowledgment
  accuracy_acknowledged: boolean;
}

const INITIAL_FORM: SurveyForm = {
  service_type: "",
  equipment_type: "",
  work_description: "",
  requestor_name: "",
  requestor_email: "",
  requestor_phone: "",
  requestor_company: "",
  onsite_contact_name: "",
  onsite_contact_phone: "",
  onsite_contact_role: "",
  same_as_requestor: false,
  site_address: "",
  site_city: "",
  site_state: "",
  site_zip: "",
  gate_or_security: false,
  gate_details: "",
  dock_access: true,
  dock_details: "",
  floor_level: "ground",
  elevator_available: false,
  choke_width_inches: "",
  choke_height_inches: "",
  ceiling_height_feet: "",
  path_description: "",
  electrical_voltage: "",
  electrical_phase: "",
  electrical_amperage: "",
  disconnect_in_place: false,
  electrical_distance_ft: "",
  electrical_notes: "",
  forklift_available: false,
  forklift_capacity_lbs: "",
  other_equipment: "",
  preferred_date: "",
  preferred_time_window: "anytime",
  special_instructions: "",
  hazardous_materials: false,
  hazmat_details: "",
  photos_equipment: [],
  photos_access: [],
  photos_electrical: [],
  photos_facility: [],
  accuracy_acknowledged: false,
};

const SERVICE_TYPES = [
  { value: "repair", label: "Repair" },
  { value: "maintenance", label: "Preventive Maintenance" },
  { value: "installation", label: "New Installation" },
  { value: "removal", label: "Equipment Removal" },
  { value: "relocation", label: "Equipment Relocation" },
  { value: "inspection", label: "Inspection / Assessment" },
];

const EQUIPMENT_TYPES = [
  { value: "vertical_baler", label: "Vertical Baler" },
  { value: "horizontal_baler", label: "Horizontal Baler" },
  { value: "auto_tie", label: "Auto-Tie Baler" },
  { value: "two_ram", label: "Two-Ram Baler" },
  { value: "compactor", label: "Compactor" },
  { value: "conveyor", label: "Conveyor System" },
  { value: "other", label: "Other" },
];

/* ─── Step definitions ──────────────────────────────────── */

const STEPS = [
  { id: "service", label: "Service Info", icon: Wrench },
  { id: "contact", label: "Contact", icon: User },
  { id: "location", label: "Location & Access", icon: MapPin },
  { id: "clearance", label: "Clearance", icon: Ruler },
  { id: "electrical", label: "Electrical", icon: Zap },
  { id: "resources", label: "On-Site Resources", icon: Truck },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "review", label: "Review & Submit", icon: ClipboardCheck },
];

/* ─── Component ─────────────────────────────────────────── */

export default function SiteSurveyPage() {
  const [form, setForm] = useState<SurveyForm>(INITIAL_FORM);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [sessionId] = useState(() => crypto.randomUUID());

  // Read deal_id from URL if CRM-linked
  const [dealId, setDealId] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get("deal_id");
    if (d) setDealId(d);
  }, []);

  const update = (field: keyof SurveyForm, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      update(name as keyof SurveyForm, (e.target as HTMLInputElement).checked);
    } else {
      update(name as keyof SurveyForm, value);
    }
  };

  /* Copy requestor → on-site contact */
  useEffect(() => {
    if (form.same_as_requestor) {
      setForm((prev) => ({
        ...prev,
        onsite_contact_name: prev.requestor_name,
        onsite_contact_phone: prev.requestor_phone,
      }));
    }
  }, [form.same_as_requestor, form.requestor_name, form.requestor_phone]);

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!form.accuracy_acknowledged) {
      setErrorMsg("Please acknowledge the accuracy statement before submitting.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    try {
      const payload = {
        ...form,
        deal_id: dealId,
        session_id: sessionId,
        choke_width_inches: form.choke_width_inches ? Number(form.choke_width_inches) : null,
        choke_height_inches: form.choke_height_inches ? Number(form.choke_height_inches) : null,
        ceiling_height_feet: form.ceiling_height_feet ? Number(form.ceiling_height_feet) : null,
        electrical_distance_ft: form.electrical_distance_ft ? Number(form.electrical_distance_ft) : null,
        forklift_capacity_lbs: form.forklift_capacity_lbs ? Number(form.forklift_capacity_lbs) : null,
      };

      const res = await fetch("/api/site-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Submission failed");
      }

      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please call 857-422-6348.");
    }
  };

  /* ─── Success screen ─────────────────────────────────── */
  if (status === "success") {
    return (
      <main className="min-h-screen bg-[#0A0A0A]">
        <div className="container-site py-20">
          <div className="max-w-lg mx-auto card-dark text-center py-12">
            <CheckCircle className="mx-auto text-[#39FF14] mb-4" size={56} />
            <h2 className="text-2xl font-bold text-white mb-3">
              Site Survey Submitted
            </h2>
            <p className="text-gray-400 mb-6">
              Thank you! Our team will review your survey and get back to you
              as soon as we can. We may reach out if we need any clarification.
            </p>
            <a href="/" className="btn-primary">
              Back to Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  /* ─── Progress bar ───────────────────────────────────── */
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <section className="border-b border-[#1F2937]">
        <div className="container-site py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardCheck size={28} className="text-[#39FF14]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Pre-Service Site Survey
            </h1>
          </div>
          <p className="text-gray-400 text-sm max-w-2xl">
            Complete this form before your scheduled service visit. Accurate
            information helps our technicians arrive prepared and avoid delays.
          </p>
          {dealId && (
            <p className="mt-2 badge-green text-xs">
              Linked to Deal #{dealId.slice(0, 8)}
            </p>
          )}
        </div>
      </section>

      {/* Progress */}
      <div className="sticky top-16 z-30 border-b border-[#1F2937]" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="container-site py-3">
          {/* Step indicators - horizontal scroll on mobile */}
          <div className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30"
                      : isDone
                        ? "bg-[#39FF14]/5 text-[#39FF14]/60 border border-[#39FF14]/10"
                        : "text-gray-500 border border-transparent"
                  }`}
                >
                  <Icon size={12} />
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </button>
              );
            })}
          </div>
          {/* Progress bar */}
          <div className="h-1 mt-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-input)" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: "var(--green-accent)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Form body */}
      <div className="container-site py-8">
        <div className="max-w-2xl mx-auto">
          {/* ── Step 0: Service Info ─────────────────────── */}
          {step === 0 && (
            <StepWrapper title="What service do you need?" icon={Wrench}>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Service Type *</label>
                  <select
                    name="service_type"
                    value={form.service_type}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select service type...</option>
                    {SERVICE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Equipment Type</label>
                  <select
                    name="equipment_type"
                    value={form.equipment_type}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select equipment type...</option>
                    {EQUIPMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Description of Work Needed</label>
                  <textarea
                    name="work_description"
                    value={form.work_description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the work needed, current equipment condition, or installation requirements..."
                    className="input-field resize-none"
                  />
                </div>

                <div>
                  <label className="input-label">Preferred Service Date</label>
                  <input
                    name="preferred_date"
                    type="date"
                    value={form.preferred_date}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Preferred Time Window</label>
                  <select
                    name="preferred_time_window"
                    value={form.preferred_time_window}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="anytime">Anytime</option>
                    <option value="morning">Morning (7am - 12pm)</option>
                    <option value="afternoon">Afternoon (12pm - 5pm)</option>
                  </select>
                </div>
              </div>
            </StepWrapper>
          )}

          {/* ── Step 1: Contact Info ─────────────────────── */}
          {step === 1 && (
            <StepWrapper title="Contact Information" icon={User}>
              <div className="space-y-4">
                <p className="text-xs text-gray-500 flex items-start gap-1.5">
                  <Info size={12} className="mt-0.5 shrink-0" />
                  The person completing this form and the on-site contact may be different.
                </p>

                <h4 className="text-sm font-semibold text-white mt-4">Your Information</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Name *</label>
                    <input
                      name="requestor_name"
                      value={form.requestor_name}
                      onChange={handleChange}
                      required
                      placeholder="John Smith"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="input-label">Company</label>
                    <input
                      name="requestor_company"
                      value={form.requestor_company}
                      onChange={handleChange}
                      placeholder="ABC Distribution"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="input-label">Phone *</label>
                    <input
                      name="requestor_phone"
                      type="tel"
                      value={form.requestor_phone}
                      onChange={handleChange}
                      required
                      placeholder="(555) 000-0000"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="input-label">Email</label>
                    <input
                      name="requestor_email"
                      type="email"
                      value={form.requestor_email}
                      onChange={handleChange}
                      placeholder="john@company.com"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="divider-green !my-6" />

                <h4 className="text-sm font-semibold text-white">On-Site Contact</h4>

                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="same_as_requestor"
                    checked={form.same_as_requestor}
                    onChange={handleChange}
                    className="rounded border-gray-600 bg-transparent"
                  />
                  Same as above
                </label>

                {!form.same_as_requestor && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">On-Site Contact Name *</label>
                      <input
                        name="onsite_contact_name"
                        value={form.onsite_contact_name}
                        onChange={handleChange}
                        placeholder="Site manager name"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="input-label">On-Site Contact Phone *</label>
                      <input
                        name="onsite_contact_phone"
                        type="tel"
                        value={form.onsite_contact_phone}
                        onChange={handleChange}
                        placeholder="(555) 000-0000"
                        className="input-field"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="input-label">Role / Title</label>
                      <input
                        name="onsite_contact_role"
                        value={form.onsite_contact_role}
                        onChange={handleChange}
                        placeholder="e.g. Dock Supervisor, Maintenance Lead"
                        className="input-field"
                      />
                    </div>
                  </div>
                )}
              </div>
            </StepWrapper>
          )}

          {/* ── Step 2: Location & Access ────────────────── */}
          {step === 2 && (
            <StepWrapper title="Site Location & Access" icon={MapPin}>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Site Address *</label>
                  <AddressAutofill
                    value={form.site_address}
                    onChange={(val) => update("site_address", val)}
                    onSelect={(parts) => {
                      setForm((prev) => ({
                        ...prev,
                        site_address: parts.full_address,
                        site_city: parts.city,
                        site_state: parts.state,
                        site_zip: parts.zip,
                      }));
                    }}
                    required
                    placeholder="123 Industrial Blvd, City, State..."
                  />
                </div>

                <div className="divider-green !my-6" />

                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <DoorOpen size={16} className="text-[#39FF14]" />
                  Site Access
                </h4>

                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="gate_or_security"
                    checked={form.gate_or_security}
                    onChange={handleChange}
                    className="rounded border-gray-600 bg-transparent"
                  />
                  Gate, guardshack, or security checkpoint
                </label>

                {form.gate_or_security && (
                  <div>
                    <label className="input-label">Gate / Security Details</label>
                    <textarea
                      name="gate_details"
                      value={form.gate_details}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Gate code, check-in process, ID required, call-ahead number..."
                      className="input-field resize-none"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="dock_access"
                    checked={form.dock_access}
                    onChange={handleChange}
                    className="rounded border-gray-600 bg-transparent"
                  />
                  Dock / door access available
                </label>

                <div>
                  <label className="input-label">Dock / Door Details</label>
                  <textarea
                    name="dock_details"
                    value={form.dock_details}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Which dock number, ground-level access, rollup door dimensions, rear entrance only..."
                    className="input-field resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Floor / Level</label>
                    <select
                      name="floor_level"
                      value={form.floor_level}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="ground">Ground Level</option>
                      <option value="basement">Basement</option>
                      <option value="mezzanine">Mezzanine</option>
                      <option value="2nd_floor">2nd Floor</option>
                      <option value="3rd_floor_plus">3rd Floor+</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer pb-3">
                      <input
                        type="checkbox"
                        name="elevator_available"
                        checked={form.elevator_available}
                        onChange={handleChange}
                        className="rounded border-gray-600 bg-transparent"
                      />
                      Freight elevator available
                    </label>
                  </div>
                </div>
              </div>
            </StepWrapper>
          )}

          {/* ── Step 3: Clearance / Choke Points ─────────── */}
          {step === 3 && (
            <StepWrapper title="Clearance & Access Points" icon={Ruler}>
              <div className="space-y-4">
                <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: "var(--green-bg)", border: "1px solid var(--green-border)" }}>
                  <Info size={16} className="text-[#39FF14] mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-300">
                    Measure the <strong className="text-white">narrowest doorway, hallway, or passage</strong> between
                    the dock/entrance and the equipment location. This determines what
                    equipment we can bring in.
                  </p>
                </div>

                <h4 className="text-sm font-semibold text-white">Narrowest Access Point (Choke Point)</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Width (inches) *</label>
                    <input
                      name="choke_width_inches"
                      type="number"
                      inputMode="decimal"
                      value={form.choke_width_inches}
                      onChange={handleChange}
                      placeholder="e.g. 36"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="input-label">Height (inches) *</label>
                    <input
                      name="choke_height_inches"
                      type="number"
                      inputMode="decimal"
                      value={form.choke_height_inches}
                      onChange={handleChange}
                      placeholder="e.g. 84"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Ceiling Height at Install Location (feet)</label>
                  <input
                    name="ceiling_height_feet"
                    type="number"
                    inputMode="decimal"
                    value={form.ceiling_height_feet}
                    onChange={handleChange}
                    placeholder="e.g. 14"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Path from Entrance to Equipment Location</label>
                  <textarea
                    name="path_description"
                    value={form.path_description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the route: straight shot from dock, left turn through double doors, down a hallway, etc."
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </StepWrapper>
          )}

          {/* ── Step 4: Electrical ───────────────────────── */}
          {step === 4 && (
            <StepWrapper title="Electrical Requirements" icon={Zap}>
              <div className="space-y-4">
                <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: "var(--green-bg)", border: "1px solid var(--green-border)" }}>
                  <ShieldAlert size={16} className="text-[#39FF14] mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-300">
                    Bandit does <strong className="text-white">not</strong> provide electrical work (disconnects,
                    wiring, panel upgrades). Having this information ready prevents delays
                    when your electrician needs to prep the site before installation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="input-label">Voltage</label>
                    <select
                      name="electrical_voltage"
                      value={form.electrical_voltage}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Unknown</option>
                      <option value="120V">120V</option>
                      <option value="208V">208V</option>
                      <option value="240V">240V</option>
                      <option value="480V">480V</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Phase</label>
                    <select
                      name="electrical_phase"
                      value={form.electrical_phase}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Unknown</option>
                      <option value="single">Single Phase</option>
                      <option value="three">Three Phase</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Amperage</label>
                    <select
                      name="electrical_amperage"
                      value={form.electrical_amperage}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Unknown</option>
                      <option value="20A">20A</option>
                      <option value="30A">30A</option>
                      <option value="60A">60A</option>
                      <option value="100A">100A</option>
                      <option value="200A">200A</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="disconnect_in_place"
                    checked={form.disconnect_in_place}
                    onChange={handleChange}
                    className="rounded border-gray-600 bg-transparent"
                  />
                  Electrical disconnect already in place
                </label>

                <div>
                  <label className="input-label">Distance from Panel to Equipment Location (feet)</label>
                  <input
                    name="electrical_distance_ft"
                    type="number"
                    inputMode="decimal"
                    value={form.electrical_distance_ft}
                    onChange={handleChange}
                    placeholder="Approximate distance in feet"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Electrical Notes</label>
                  <textarea
                    name="electrical_notes"
                    value={form.electrical_notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Any additional info about electrical setup, recent upgrades, known issues..."
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </StepWrapper>
          )}

          {/* ── Step 5: On-Site Resources ────────────────── */}
          {step === 5 && (
            <StepWrapper title="Available On-Site Equipment" icon={Truck}>
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="forklift_available"
                    checked={form.forklift_available}
                    onChange={handleChange}
                    className="rounded border-gray-600 bg-transparent"
                  />
                  Forklift available on site
                </label>

                {form.forklift_available && (
                  <div>
                    <label className="input-label">Forklift Lift Capacity (lbs)</label>
                    <input
                      name="forklift_capacity_lbs"
                      type="number"
                      inputMode="numeric"
                      value={form.forklift_capacity_lbs}
                      onChange={handleChange}
                      placeholder="e.g. 5000"
                      className="input-field"
                    />
                  </div>
                )}

                <div>
                  <label className="input-label">Other Equipment Available</label>
                  <textarea
                    name="other_equipment"
                    value={form.other_equipment}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Pallet jack, overhead crane, lull, boom lift, etc."
                    className="input-field resize-none"
                  />
                </div>

                <div className="divider-green !my-6" />

                <h4 className="text-sm font-semibold text-white">Hazardous Materials</h4>

                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hazardous_materials"
                    checked={form.hazardous_materials}
                    onChange={handleChange}
                    className="rounded border-gray-600 bg-transparent"
                  />
                  Hazardous materials present in the work area
                </label>

                {form.hazardous_materials && (
                  <div>
                    <label className="input-label">Hazmat Details</label>
                    <textarea
                      name="hazmat_details"
                      value={form.hazmat_details}
                      onChange={handleChange}
                      rows={2}
                      placeholder="What materials, any required PPE, safety protocols..."
                      className="input-field resize-none"
                    />
                  </div>
                )}

                <div>
                  <label className="input-label">Special Instructions</label>
                  <textarea
                    name="special_instructions"
                    value={form.special_instructions}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Anything else our crew should know: parking restrictions, quiet hours, active production schedules, PPE requirements, nearby restrooms..."
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </StepWrapper>
          )}

          {/* ── Step 6: Photos ───────────────────────────── */}
          {step === 6 && (
            <StepWrapper title="Site Photos" icon={Camera}>
              <div className="space-y-6">
                <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: "var(--green-bg)", border: "1px solid var(--green-border)" }}>
                  <Camera size={16} className="text-[#39FF14] mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-300">
                    Photos help our team plan ahead and arrive prepared. Use your phone
                    camera to capture the areas below. The more detail, the better.
                  </p>
                </div>

                <PhotoUpload
                  label="Equipment / Install Location"
                  hint="Current equipment (make/model plate if visible), or the area where new equipment will go"
                  category="equipment"
                  sessionId={sessionId}
                  photos={form.photos_equipment}
                  onChange={(photos) => update("photos_equipment", photos)}
                />

                <PhotoUpload
                  label="Access Points & Choke Points"
                  hint="Narrowest doorways, dock doors, hallways, turns — anything equipment must fit through"
                  category="access"
                  sessionId={sessionId}
                  photos={form.photos_access}
                  onChange={(photos) => update("photos_access", photos)}
                />

                <PhotoUpload
                  label="Electrical Panel & Disconnect"
                  hint="Main panel, existing disconnect (if any), breaker labels, wire gauge if visible"
                  category="electrical"
                  sessionId={sessionId}
                  photos={form.photos_electrical}
                  onChange={(photos) => update("photos_electrical", photos)}
                />

                <PhotoUpload
                  label="Facility Overview"
                  hint="Dock area, parking/staging area, overhead clearance, anything else relevant"
                  category="facility"
                  sessionId={sessionId}
                  photos={form.photos_facility}
                  onChange={(photos) => update("photos_facility", photos)}
                />
              </div>
            </StepWrapper>
          )}

          {/* ── Step 7: Review & Submit ──────────────────── */}
          {step === 7 && (
            <StepWrapper title="Review & Submit" icon={ClipboardCheck}>
              <div className="space-y-4">
                {/* Summary cards */}
                <ReviewSection label="Service">
                  <ReviewLine label="Type" value={SERVICE_TYPES.find((t) => t.value === form.service_type)?.label || "—"} />
                  <ReviewLine label="Equipment" value={EQUIPMENT_TYPES.find((t) => t.value === form.equipment_type)?.label || "—"} />
                  <ReviewLine label="Preferred Date" value={form.preferred_date || "Not specified"} />
                  {form.work_description && <ReviewLine label="Description" value={form.work_description} />}
                </ReviewSection>

                <ReviewSection label="Contact">
                  <ReviewLine label="Requestor" value={`${form.requestor_name} - ${form.requestor_phone}`} />
                  <ReviewLine label="On-Site" value={`${form.onsite_contact_name || form.requestor_name} - ${form.onsite_contact_phone || form.requestor_phone}`} />
                </ReviewSection>

                <ReviewSection label="Location & Access">
                  <ReviewLine label="Address" value={form.site_address || "—"} />
                  <ReviewLine label="Security" value={form.gate_or_security ? `Yes — ${form.gate_details}` : "No"} />
                  <ReviewLine label="Dock" value={form.dock_access ? (form.dock_details || "Yes") : "No dock access"} />
                  <ReviewLine label="Floor" value={form.floor_level} />
                </ReviewSection>

                <ReviewSection label="Clearance">
                  <ReviewLine label="Choke Point" value={form.choke_width_inches && form.choke_height_inches ? `${form.choke_width_inches}" W x ${form.choke_height_inches}" H` : "Not measured"} />
                  <ReviewLine label="Ceiling" value={form.ceiling_height_feet ? `${form.ceiling_height_feet} ft` : "Not measured"} />
                </ReviewSection>

                <ReviewSection label="Electrical">
                  <ReviewLine label="Power" value={[form.electrical_voltage, form.electrical_phase, form.electrical_amperage].filter(Boolean).join(" / ") || "Unknown"} />
                  <ReviewLine label="Disconnect" value={form.disconnect_in_place ? "In place" : "Not in place"} />
                </ReviewSection>

                <ReviewSection label="On-Site Resources">
                  <ReviewLine label="Forklift" value={form.forklift_available ? `Yes — ${form.forklift_capacity_lbs || "?"} lbs` : "None"} />
                  {form.other_equipment && <ReviewLine label="Other" value={form.other_equipment} />}
                </ReviewSection>

                <ReviewSection label="Photos">
                  <ReviewLine label="Equipment" value={`${form.photos_equipment.length} uploaded`} />
                  <ReviewLine label="Access" value={`${form.photos_access.length} uploaded`} />
                  <ReviewLine label="Electrical" value={`${form.photos_electrical.length} uploaded`} />
                  <ReviewLine label="Facility" value={`${form.photos_facility.length} uploaded`} />
                </ReviewSection>

                {/* Acknowledgment */}
                <div className="mt-6 p-4 rounded-lg border border-yellow-600/30 bg-yellow-900/10">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="accuracy_acknowledged"
                      checked={form.accuracy_acknowledged}
                      onChange={handleChange}
                      className="mt-1 rounded border-gray-600 bg-transparent"
                    />
                    <span className="text-sm text-gray-300">
                      I acknowledge that inaccurate or incomplete information on this
                      survey may result in <strong className="text-white">delays, additional time on site,
                      and additional service charges</strong>. I have provided my best
                      available information for all sections above.
                    </span>
                  </label>
                </div>

                {/* Error */}
                {(status === "error" || errorMsg) && (
                  <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-800/40 rounded-lg">
                    <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-300">{errorMsg}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={status === "loading" || !form.accuracy_acknowledged}
                  className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck size={16} />
                      Submit Site Survey
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-600">
                  Your data is transmitted securely. We will never share your
                  information with third parties.
                </p>
              </div>
            </StepWrapper>
          )}

          {/* ── Navigation buttons ───────────────────────── */}
          <div className="flex justify-between mt-6 gap-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 0}
              className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {step < STEPS.length - 1 && (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary ml-auto"
              >
                Next
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─── Helper components ─────────────────────────────────── */

function StepWrapper({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="card-dark">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={20} className="text-[#39FF14]" />
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ReviewSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)" }}>
      <h4 className="text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-2">
        {label}
      </h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ReviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-300 text-right">{value}</span>
    </div>
  );
}
