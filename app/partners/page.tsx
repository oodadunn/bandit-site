"use client";

import { useState } from "react";
import {
  CheckCircle,
  ChevronRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  Zap,
  Award,
  Users,
  ArrowRight,
  Shield,
  Phone,
} from "lucide-react";

interface PartnerFormState {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  states: string;
  years_experience: string;
  business_description: string;
}

export default function PartnersPage() {
  const [form, setForm] = useState<PartnerFormState>({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    states: "",
    years_experience: "",
    business_description: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch("/api/partner-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed to submit");
      setStatus("success");
      setForm({
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        states: "",
        years_experience: "",
        business_description: "",
      });
    } catch {
      setStatus("error");
      setErrorMsg(
        "Something went wrong. Please call us at 857-422-6348 to discuss partnership."
      );
    }
  };

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center bg-[#0A0A0A] overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Green glow top-right */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#39FF14]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-site relative py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="badge-green mb-6">Partner Program</div>
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-6">
                Grow Your Business with{" "}
                <span className="text-[#39FF14]">Bandit</span>
              </h1>
              <p className="text-xl text-gray-300 mb-4 leading-relaxed">
                Join our nationwide baler service partner network. Steady lead
                flow, flexible scheduling, and the support you need to scale.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                We're looking for licensed, experienced baler service companies
                to expand our coverage across the country. You keep your
                business. We send you qualified leads.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#apply" className="btn-primary">
                  <Users size={16} /> Apply Now
                </a>
                <a href="#how-it-works" className="btn-ghost-green">
                  How It Works <ChevronRight size={16} />
                </a>
              </div>
            </div>

            {/* Key benefits preview */}
            <div className="space-y-4">
              {[
                {
                  icon: TrendingUp,
                  title: "Steady Lead Flow",
                  desc: "Consistent qualified referrals from our network",
                },
                {
                  icon: Zap,
                  title: "Keep Your Business",
                  desc: "100% flexible scheduling and pricing freedom",
                },
                {
                  icon: Award,
                  title: "Bandit Badge",
                  desc: "Access to our brand, tools, and resources",
                },
                {
                  icon: Shield,
                  title: "Training & Support",
                  desc: "Ongoing education and operational assistance",
                },
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  className="card-dark flex gap-4 items-start hover:border-[#39FF14]/40 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#39FF14]/10 flex items-center justify-center shrink-0">
                    <benefit.icon size={20} className="text-[#39FF14]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm mb-0.5">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-gray-400">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS DEEP DIVE ────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">Why Partner With Bandit</div>
            <h2 className="section-heading text-white mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We've built the partner program to solve the core challenges every
              independent baler service provider faces.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Benefit 1 */}
            <div className="card-dark border-l-2 border-[#39FF14]">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#39FF14]/10 flex items-center justify-center shrink-0">
                  <TrendingUp size={24} className="text-[#39FF14]" />
                </div>
                <h3 className="text-lg font-bold text-white">Steady Lead Flow</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Our marketing funnel generates hundreds of qualified leads every
                month. You get a predictable stream of baler repair, maintenance,
                and equipment requests matched to your service area.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-[#39FF14] shrink-0" />
                  Leads from website, phone, and partnerships
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-[#39FF14] shrink-0" />
                  Real-time dispatch to your area
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-[#39FF14] shrink-0" />
                  No cold calling — pre-qualified prospects
                </li>
              </ul>
            </div>

            {/* Benefit 2 */}
            <div className="card-dark border-l-2 border-[#39FF14]">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#39FF14]/10 flex items-center justify-center shrink-0">
                  <Zap size={24} className="text-[#39FF14]" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Flexible Scheduling
                </h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                You keep your existing business intact. Set your own rates, work
                your own schedule, accept only the jobs you want. Bandit sends
                leads — you decide what to do with them.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-[#39FF14] shrink-0" />
                  Keep all your direct customers
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-[#39FF14] shrink-0" />
                  Set your own pricing and rates
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-[#39FF14] shrink-0" />
                  Pick and choose your jobs
                </li>
              </ul>
            </div>

            {/* Benefit 3 */}
            <div className="card-dark border-l-2 border-[#39FF14]">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#39FF14]/10 flex items-center justify-center shrink-0">
                  <Award size={24} className="text-[#39FF14]" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Bandit Brand & Tools
                </h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Access our brand reputation, dispatch system, lead management
                tools, and customer portal. Marketing materials, branded van
                decals, and digital presence to make you look professional.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-[#39FF14] shrink-0" />
                  Branded dispatch platform
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-[#39FF14] shrink-0" />
                  Marketing materials and collateral
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-[#39FF14] shrink-0" />
                  Customer portal for job management
                </li>
              </ul>
            </div>

            {/* Benefit 4 */}
            <div className="card-dark border-l-2 border-[#39FF14]">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#39FF14]/10 flex items-center justify-center shrink-0">
                  <Shield size={24} className="text-[#39FF14]" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Training & Support
                </h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                We invest in your success. Access to our technical library,
                training resources, industry contacts, and a dedicated support
                team to help you scale operations.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-[#39FF14] shrink-0" />
                  Technical training library
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-[#39FF14] shrink-0" />
                  Parts and equipment partnerships
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-[#39FF14] shrink-0" />
                  Dedicated partner success manager
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="text-center mb-16">
            <div className="badge-green mb-4">Simple Process</div>
            <h2 className="section-heading text-white mb-4">
              Three Steps to Partnership
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              From application to leads in your inbox — the partnership process
              is straightforward and designed to move fast.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="card-dark text-center h-full flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#39FF14]/10 border-2 border-[#39FF14] flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-black text-[#39FF14] font-mono">
                    1
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Apply</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Fill out the partner application form. Tell us about your
                  experience, service area, and business.
                </p>
              </div>
              {/* Arrow */}
              <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 transform">
                <div className="w-8 h-0.5 bg-[#39FF14]/30" />
                <ChevronRight size={20} className="text-[#39FF14]" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="card-dark text-center h-full flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#39FF14]/10 border-2 border-[#39FF14] flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-black text-[#39FF14] font-mono">
                    2
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Get Vetted</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  We review your credentials, verify licensing and insurance,
                  and confirm your service area.
                </p>
              </div>
              {/* Arrow */}
              <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 transform">
                <div className="w-8 h-0.5 bg-[#39FF14]/30" />
                <ChevronRight size={20} className="text-[#39FF14]" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="card-dark text-center h-full flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#39FF14]/10 border-2 border-[#39FF14] flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-black text-[#39FF14] font-mono">
                    3
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">
                  Start Earning
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Leads start flowing to your area. You accept jobs, complete
                  work, and get paid.
                </p>
              </div>
            </div>
          </div>

          {/* Timeline detail */}
          <div className="mt-16 max-w-3xl mx-auto card-dark">
            <h3 className="font-bold text-white mb-6">Timeline</h3>
            <div className="space-y-4">
              {[
                { label: "Application submission", time: "5 minutes" },
                { label: "Vetting process", time: "3-5 business days" },
                {
                  label: "Setup and onboarding",
                  time: "1-2 business days",
                },
                { label: "First leads arrive", time: "Same week or next" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3 border-b border-[#1F2937] last:border-0"
                >
                  <span className="text-sm text-gray-400">{item.label}</span>
                  <span className="text-sm font-mono font-semibold text-[#39FF14]">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── REQUIREMENTS ──────────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">Partner Requirements</div>
            <h2 className="section-heading text-white mb-4">
              What We're Looking For
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Partners who share our commitment to quality service, safety, and
              customer satisfaction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: "Current Licenses",
                desc: "Valid business license and HVAC/mechanical licensing in your state(s)",
              },
              {
                title: "Insurance Coverage",
                desc: "$1M+ commercial general liability and vehicle insurance minimum",
              },
              {
                title: "Baler Experience",
                desc: "3+ years of documented baler repair, maintenance, or service experience",
              },
              {
                title: "Equipped to Serve",
                desc: "Transportation, tools, and diagnostic equipment to service balers on-site",
              },
              {
                title: "Clean Background",
                desc: "No active legal issues or licensing suspensions in your jurisdiction",
              },
              {
                title: "Geographic Coverage",
                desc: "Ability to service customers within defined service area (typically single state)",
              },
            ].map((req, idx) => (
              <div key={idx} className="card-dark">
                <h3 className="font-bold text-white mb-2">{req.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {req.desc}
                </p>
              </div>
            ))}
          </div>

          {/* FAQ-style note */}
          <div className="card-dark border-l-2 border-[#39FF14] bg-[#39FF14]/5 max-w-3xl mx-auto">
            <h3 className="font-bold text-white mb-3">Questions?</h3>
            <p className="text-sm text-gray-400 mb-4">
              Don't see your specific situation covered above. We work with
              partners across different business models — call us to discuss
              whether partnership makes sense for your operation.
            </p>
            <a
              href="tel:+18574226348"
              className="inline-flex items-center gap-2 text-[#39FF14] font-semibold text-sm hover:gap-3 transition-all"
            >
              Talk to our team <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ── APPLICATION FORM ──────────────────────────────────────────── */}
      <section id="apply" className="py-24 bg-[#0A0A0A]">
        <div className="container-site">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="badge-green mb-4">Ready to Partner?</div>
              <h2 className="section-heading text-white mb-4">
                Partner Application
              </h2>
              <p className="text-gray-400">
                Fill out the form below and we'll be in touch within 1 business
                day to discuss next steps.
              </p>
            </div>

            {/* Success state */}
            {status === "success" ? (
              <div className="card-dark text-center py-12">
                <CheckCircle className="mx-auto text-[#39FF14] mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">
                  Application Received!
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Thanks for applying to the Bandit partner program. We&apos;ll review
                  your information and get back to you as soon as we can.
                </p>
                <p className="text-gray-500 text-xs">
                  Questions?{" "}
                  <a
                    href="tel:+18574226348"
                    className="text-[#39FF14] hover:underline"
                  >
                    Call us at 857-422-6348
                  </a>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card-dark space-y-6">
                {/* Company Info Row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Company Name *</label>
                    <input
                      name="company_name"
                      required
                      value={form.company_name}
                      onChange={handleChange}
                      placeholder="ABC Baler Service"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="input-label">Contact Name *</label>
                    <input
                      name="contact_name"
                      required
                      value={form.contact_name}
                      onChange={handleChange}
                      placeholder="John Smith"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Contact Info Row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Email *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@company.com"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="input-label">Phone *</label>
                    <input
                      name="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(555) 000-0000"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Service Area Row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Service State(s) *</label>
                    <select
                      name="states"
                      required
                      value={form.states}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Select states...</option>
                      {[
                        "Alabama", "Alaska", "Arizona", "Arkansas", "California",
                        "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
                        "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
                        "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
                        "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
                        "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
                        "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
                        "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
                        "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
                        "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
                        "Multiple States",
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">
                      Years of Baler Experience *
                    </label>
                    <select
                      name="years_experience"
                      required
                      value={form.years_experience}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Select experience level...</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10-15">10-15 years</option>
                      <option value="15+">15+ years</option>
                    </select>
                  </div>
                </div>

                {/* Business Description */}
                <div>
                  <label className="input-label">
                    Tell Us About Your Business *
                  </label>
                  <textarea
                    name="business_description"
                    required
                    value={form.business_description}
                    onChange={handleChange}
                    placeholder="Describe your current baler service operation, equipment, team size, and why you're interested in partnering with Bandit..."
                    rows={5}
                    className="input-field resize-none"
                  />
                </div>

                {/* Error state */}
                {status === "error" && (
                  <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-800/40 rounded-lg">
                    <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-300">{errorMsg}</p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Users size={16} /> Submit Application
                    </>
                  )}
                </button>

                {/* Privacy note */}
                <p className="text-xs text-center text-gray-600">
                  We'll review your information and follow up within 1 business
                  day. Questions? Call{" "}
                  <a href="tel:+18574226348" className="text-[#39FF14] hover:underline">
                    857-422-6348
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ───────────────────────────────────────────────── */}
      <section className="py-24 bg-[#050505]">
        <div className="container-site max-w-3xl">
          <div className="text-center mb-14">
            <div className="badge-green mb-4">FAQs</div>
            <h2 className="section-heading text-white">Common Questions</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "Do I have to leave my current business to partner with Bandit?",
                a: "No. You keep 100% of your existing customers and business. Bandit simply adds new leads to your pipeline — you control what you accept and how you price.",
              },
              {
                q: "What's the commission or fee structure?",
                a: "We discuss revenue sharing on a case-by-case basis depending on your service area, experience level, and business model. Call us for specifics.",
              },
              {
                q: "How many leads can I expect?",
                a: "It varies by state and service area, but active partners see between 5-20 qualified leads per month. We send leads in real-time based on customer requests.",
              },
              {
                q: "Can I partner with you in my state?",
                a: "We're actively expanding nationwide. If you're interested in partnering, let's discuss how we can work together in your region.",
              },
              {
                q: "Do I need Bandit branding on my van/truck?",
                a: "We encourage it, but it's not required. We provide decals and marketing materials, and you can use them if you want to.",
              },
              {
                q: "What happens if I can't handle a lead that comes my way?",
                a: "Just let us know you can't take it. We'll route it to another partner or handle it in-house. No penalties — you take what works for your schedule.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="card-dark">
                <h3 className="font-bold text-white mb-3 text-sm">{faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#39FF14]">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] mb-4">
                Ready to scale your baler service business?
              </h2>
              <p className="text-[#0A0A0A]/70 leading-relaxed">
                Apply to the Bandit partner program today. Steady leads, zero
                business disruption, and the support you need to grow.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <a
                href="#apply"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0A0A0A] text-white font-bold rounded-md text-base hover:bg-black transition-colors"
              >
                <Users size={18} /> Apply Now
              </a>
              <a
                href="tel:+18574226348"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#0A0A0A] text-[#0A0A0A] font-bold rounded-md text-base hover:bg-[#0A0A0A] hover:text-[#39FF14] transition-colors"
              >
                <Phone size={18} /> Call 857-422-6348
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
