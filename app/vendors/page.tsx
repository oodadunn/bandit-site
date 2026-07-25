import type { Metadata } from "next";
import { CheckCircle, FileCheck, Search, Send } from "lucide-react";
import VendorApplicationForm from "@/components/VendorApplicationForm";

export const metadata: Metadata = {
  title: "Become a Bandit Vendor",
  description: "Apply to provide baler service, bale wire, equipment, parts, or logistics through the Bandit vendor network.",
};

export default function VendorsPage() {
  return (
    <>
      <section className="bg-[#0A0A0A] border-b border-white/10">
        <div className="container-site py-20 sm:py-24 grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-[1.02] tracking-tight mb-6">Work with Bandit.<br /><span className="text-[#39FF14]">Keep the paperwork simple.</span></h1>
            <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">We&apos;re building a dependable network of baler service companies, wire suppliers, equipment providers, and logistics partners. Start with one short application; we&apos;ll request tax, insurance, or payment documents only after there&apos;s a fit.</p>
          </div>
          <div className="border-l border-white/10 pl-8 space-y-6">
            {[{ icon: Send, title: "Apply", text: "Tell us what you provide and where you operate." },{ icon: Search, title: "Review", text: "We confirm coverage, capacity, and basic qualifications." },{ icon: FileCheck, title: "Complete onboarding", text: "Approved vendors receive a secure link for agreements and documents." }].map(({ icon: Icon, title, text }, index) => <div key={title} className="flex gap-4"><span className="text-xs font-mono text-[#39FF14] pt-1">0{index + 1}</span><Icon className="text-[#39FF14] shrink-0" size={20} /><div><h2 className="font-bold text-white">{title}</h2><p className="text-sm text-gray-400 mt-1">{text}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="bg-[#050505] py-16 sm:py-20">
        <div className="container-site grid lg:grid-cols-[320px_minmax(0,1fr)] gap-12 items-start">
          <aside className="lg:sticky lg:top-24">
            <h2 className="text-2xl font-bold text-white mb-4">One form for every vendor type.</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">Select everything your company can provide. The form only shows questions that matter to your application.</p>
            <ul className="space-y-3 text-sm text-gray-300">
              {["Baler repair and maintenance", "Bale wire supply and delivery", "Equipment, parts, and consumables", "Rigging, transport, and logistics"].map((item) => <li key={item} className="flex gap-2"><CheckCircle size={15} className="text-[#39FF14] shrink-0 mt-0.5" />{item}</li>)}
            </ul>
            <div className="mt-8 p-4 border border-white/10 rounded-lg bg-[#111]"><p className="text-xs font-semibold text-white mb-1">Have documents ready?</p><p className="text-xs text-gray-500 leading-relaxed">You can tell us now, but do not send bank details, tax IDs, or policy documents through this public form.</p></div>
          </aside>
          <VendorApplicationForm />
        </div>
      </section>
    </>
  );
}
