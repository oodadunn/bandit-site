"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle, ChevronDown, Loader2, Minus, Plus, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { WIRE_CATALOG, type WireProduct } from "@/lib/wire-catalog";

type Category = WireProduct["category"];
type QuoteLines = Record<string, number>;
type FormState = {
  customer_name: string;
  company: string;
  email: string;
  phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zip: string;
  equipment_make: string;
  equipment_model: string;
  customer_notes: string;
};

const EMPTY_FORM: FormState = {
  customer_name: "", company: "", email: "", phone: "", delivery_address: "", delivery_city: "",
  delivery_state: "", delivery_zip: "", equipment_make: "", equipment_model: "", customer_notes: "",
};

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default function WireOrderBuilder() {
  const [category, setCategory] = useState<Category>("bale-tie");
  const [gauge, setGauge] = useState("all");
  const [length, setLength] = useState("all");
  const [bundleSize, setBundleSize] = useState("all");
  const [visibleCount, setVisibleCount] = useState(10);
  const [lines, setLines] = useState<QuoteLines>({});
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setForm((current) => ({ ...current, email: data.user?.email ?? current.email }));
    });
    try {
      const saved = localStorage.getItem("bandit-wire-reorder");
      if (saved) {
        const reorder = JSON.parse(saved) as { lines?: QuoteLines; form?: Partial<FormState> };
        if (reorder.lines) setLines(reorder.lines);
        if (reorder.form) setForm((current) => ({ ...current, ...reorder.form }));
        localStorage.removeItem("bandit-wire-reorder");
      }
    } catch {
      localStorage.removeItem("bandit-wire-reorder");
    }
  }, []);

  const availableGauges = useMemo(() => Array.from(new Set(WIRE_CATALOG.filter((p) => p.category === category).map((p) => p.gauge))), [category]);
  const availableLengths = useMemo(() => Array.from(new Set(WIRE_CATALOG.filter((p) => p.category === category && p.lengthFt).map((p) => p.lengthFt!))), [category]);
  const filtered = useMemo(() => WIRE_CATALOG.filter((product) => {
    if (product.category !== category) return false;
    if (gauge !== "all" && product.gauge !== Number(gauge)) return false;
    if (length !== "all" && product.lengthFt !== Number(length)) return false;
    if (bundleSize !== "all") {
      const productSize = category === "bale-tie" ? product.wiresPerBundle : product.weightLb;
      if (productSize !== Number(bundleSize)) return false;
    }
    return true;
  }), [category, gauge, length, bundleSize]);

  const quoteItems = useMemo(() => Object.entries(lines).flatMap(([productId, quantity]) => {
    const product = WIRE_CATALOG.find((item) => item.id === productId);
    return product && quantity > 0 ? [{ product, quantity }] : [];
  }), [lines]);
  const subtotal = quoteItems.reduce((sum, item) => sum + item.product.customerPrice * item.quantity, 0);
  const packageCount = quoteItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateLine = (productId: string, quantity: number) => {
    setLines((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[productId]; else next[productId] = Math.min(quantity, 999);
      return next;
    });
  };

  const resetFilters = (nextCategory?: Category) => {
    if (nextCategory) setCategory(nextCategory);
    setGauge("all"); setLength("all"); setBundleSize("all"); setVisibleCount(10);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!quoteItems.length) { setStatus("error"); setMessage("Add at least one wire package to your quote."); return; }
    setStatus("submitting"); setMessage("");
    const { data } = await supabase.auth.getSession();
    try {
      const response = await fetch("/api/wire-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) },
        body: JSON.stringify({ ...form, items: quoteItems.map(({ product, quantity }) => ({ productId: product.id, quantity })) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Quote request failed.");
      setOrderId(result.order_id); setStatus("success");
    } catch (error) {
      setStatus("error"); setMessage(error instanceof Error ? error.message : "Quote request failed.");
    }
  };

  if (status === "success") {
    return (
      <section className="min-h-[70vh] bg-[#0A0A0A] py-24">
        <div className="container-site max-w-2xl">
          <div className="card-dark text-center py-12 sm:py-16">
            <CheckCircle size={52} className="text-[#39FF14] mx-auto mb-6" />
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">Your wire quote is in.</h1>
            <p className="text-gray-400 max-w-lg mx-auto mb-2">We saved the products, equipment, and delivery location you provided. We&apos;ll confirm freight and send the final delivered price.</p>
            <p className="text-xs text-gray-500 font-mono mb-8">Request {orderId.slice(0, 8).toUpperCase()}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/account/orders" className="btn-primary"><RotateCcw size={16} /> Save this for easy reordering</Link>
              <Link href="/wire" className="btn-ghost-green">Back to wire guide</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <section className="border-b border-white/10 bg-[#050505]">
        <div className="container-site py-14 sm:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">Bale wire, without the guesswork.</h1>
              <p className="text-lg text-gray-400 leading-relaxed">Choose your wire, see product pricing, and send one request. Freight is quoted separately based on your delivery location and order.</p>
            </div>
            <Link href="/account/orders" className="group flex items-center gap-3 border-l-2 border-[#39FF14] pl-4 py-1 text-sm">
              <RotateCcw size={18} className="text-[#39FF14]" />
              <span><span className="text-white font-semibold">Ordered before?</span><br /><span className="text-[#39FF14] group-hover:underline">Reorder in seconds</span></span>
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 mt-10 pt-6 border-t border-white/10">
            {[
              ["11-14 gauge", "Bale ties"],
              ["10-22 ft", "Tie lengths"],
              ["62-250 ties", "Per bundle"],
              ["10-12 gauge", "Box wire"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-lg font-bold text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <form onSubmit={submit} className="container-site py-10">
        <div className="grid xl:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
          <div className="min-w-0">
            <div className="border border-white/10 rounded-lg bg-[#111] p-5 mb-8">
              <h2 className="text-lg font-bold text-white">Baler details <span className="font-normal text-gray-500">(optional)</span></h2>
              <p className="text-sm text-gray-400 mt-1 mb-5">Enter your baler make and model if you want us to confirm that your selected wire is compatible before sending the final quote. This will not filter the products below.</p>
              <div className="grid md:grid-cols-2 gap-5">
                <div><label className="input-label">Equipment make</label><input className="input-field" value={form.equipment_make} onChange={(e) => setForm({ ...form, equipment_make: e.target.value })} placeholder="Harris, PTR, Maren..." /></div>
                <div><label className="input-label">Equipment model</label><input className="input-field" value={form.equipment_model} onChange={(e) => setForm({ ...form, equipment_model: e.target.value })} placeholder="Model number or name" /></div>
              </div>
            </div>

            <div className="flex border-b border-white/10 mb-5" role="tablist" aria-label="Wire category">
              {([['bale-tie','Bale ties'],['box-wire','Box wire']] as [Category,string][]).map(([value,label]) => <button key={value} type="button" onClick={() => resetFilters(value)} className={`px-5 py-3 text-sm font-semibold border-b-2 ${category === value ? 'text-[#39FF14] border-[#39FF14]' : 'text-gray-400 border-transparent hover:text-white'}`}>{label}</button>)}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <Filter label="Gauge" value={gauge} onChange={(value) => { setGauge(value); setVisibleCount(10); }} options={[['all','All gauges'],...availableGauges.map((v) => [String(v),`${v} gauge`])]} />
              {category === "bale-tie" && <Filter label="Length" value={length} onChange={(value) => { setLength(value); setVisibleCount(10); }} options={[['all','All lengths'],...availableLengths.map((v) => [String(v),`${v} ft`])]} />}
              <Filter
                label={category === "bale-tie" ? "Ties per bundle" : "Box weight"}
                value={bundleSize}
                onChange={(value) => { setBundleSize(value); setVisibleCount(10); }}
                options={[['all','All sizes'],...(Array.from(new Set(WIRE_CATALOG
                  .filter((p) => p.category === category)
                  .map((p) => category === "bale-tie" ? p.wiresPerBundle! : p.weightLb)))
                  .sort((a,b) => a-b)
                  .map((v) => [String(v), category === "bale-tie" ? `${v} ties` : `${v} lb`]))]}
              />
              <button type="button" onClick={() => resetFilters()} className="self-end h-[46px] text-sm text-gray-400 hover:text-[#39FF14]">Clear filters</button>
            </div>

            <div className="border border-white/10 rounded-lg overflow-x-auto">
              <div className="hidden md:grid grid-cols-[minmax(180px,1.5fr)_90px_120px_95px_124px] gap-3 bg-[#151515] px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500">
                <span>Gauge &amp; length</span>
                <span>{category === "bale-tie" ? "Ties / bundle" : "Box size"}</span>
                <span>Shipping unit</span>
                <span>Price</span>
                <span>Qty</span>
              </div>
              {filtered.slice(0, visibleCount).map((product) => {
                const quantity = lines[product.id] ?? 0;
                return <div key={product.id} className="grid md:grid-cols-[minmax(180px,1.5fr)_90px_120px_95px_124px] gap-3 items-center px-4 py-4 border-t border-white/10 first:border-t-0 md:first:border-t">
                  <div>
                    <p className="font-semibold text-white">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Gauge: {product.gauge}{product.lengthFt ? ` · Length: ${product.lengthFt} ft` : ""}</p>
                  </div>
                  <div className="text-sm text-gray-300">
                    <span className="md:hidden text-xs text-gray-500 mr-2">{product.category === "bale-tie" ? "Ties per bundle:" : "Box size:"}</span>
                    {product.category === "bale-tie" ? `${product.wiresPerBundle} ties` : `${product.weightLb} lb box`}
                  </div>
                  <div className="text-sm text-gray-300">
                    <span className="md:hidden text-xs text-gray-500 mr-2">Shipping unit:</span>
                    {product.category === "bale-tie" ? `${product.weightLb} lb bundle` : `${product.palletQuantity} boxes`}
                    <p className="text-xs text-gray-500 mt-1">{product.palletQuantity} per {product.category === "box-wire" ? "pallet" : "gaylord"}</p>
                  </div>
                  <div><span className="md:hidden text-xs text-gray-500 mr-2">Price:</span><span className="text-lg font-bold text-white">{money(product.customerPrice)}</span><p className="text-xs text-gray-500">per package</p></div>
                  <div className="flex items-center justify-between md:justify-end gap-2">
                    <div className="flex border border-white/15 rounded-md overflow-hidden">
                      <button type="button" aria-label={`Remove one ${product.name}`} onClick={() => updateLine(product.id, quantity - 1)} className="w-10 h-10 grid place-items-center text-gray-400 hover:text-white hover:bg-white/5"><Minus size={15} /></button>
                      <input aria-label={`Quantity for ${product.name}`} type="number" min="0" max="999" value={quantity} onChange={(e) => updateLine(product.id, Number(e.target.value))} className="w-12 h-10 text-center bg-transparent border-x border-white/15 text-white focus:outline-none" />
                      <button type="button" aria-label={`Add one ${product.name}`} onClick={() => updateLine(product.id, quantity + 1)} className="w-10 h-10 grid place-items-center text-gray-400 hover:text-white hover:bg-white/5"><Plus size={15} /></button>
                    </div>
                  </div>
                </div>;
              })}
              {!filtered.length && <p className="text-center text-gray-500 py-12">No products match those filters.</p>}
            </div>
            {visibleCount < filtered.length && <div className="text-center mt-5"><button type="button" onClick={() => setVisibleCount((count) => count + 10)} className="btn-ghost-green">Show more <ChevronDown size={15} /></button></div>}
          </div>

          <aside className="xl:sticky xl:top-24 border border-white/15 rounded-lg bg-[#111] overflow-hidden">
            <div className="p-5 border-b border-white/10 flex justify-between items-center"><h2 className="text-xl font-bold text-white">Quote summary</h2><span className="text-xs text-[#39FF14]">{packageCount} package{packageCount === 1 ? '' : 's'}</span></div>
            <div className="p-5 max-h-72 overflow-y-auto">
              {!quoteItems.length ? <p className="text-sm text-gray-500 py-4">Choose a quantity beside any product to add it here.</p> : quoteItems.map(({ product, quantity }) => <div key={product.id} className="flex gap-3 justify-between py-3 border-b border-white/10 last:border-0">
                <div><p className="text-sm font-semibold text-white">{product.name}</p><p className="text-xs text-gray-500">{quantity} x {money(product.customerPrice)}</p></div>
                <div className="flex items-start gap-2"><span className="text-sm font-semibold text-white">{money(product.customerPrice * quantity)}</span><button type="button" onClick={() => updateLine(product.id, 0)} aria-label={`Remove ${product.name}`} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button></div>
              </div>)}
            </div>
            <div className="px-5 py-4 border-y border-white/10 bg-[#0d0d0d]">
              <div className="flex justify-between text-white font-semibold"><span>Product subtotal</span><span>{money(subtotal)}</span></div>
              <p className="text-sm text-[#39FF14] mt-2">Freight quoted separately</p>
            </div>
            <div className="p-5 space-y-4">
              <h3 className="font-semibold text-white">Contact & delivery</h3>
              <div className="grid sm:grid-cols-2 xl:grid-cols-1 gap-3">
                <Field required label="Your name" value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} />
                <Field required label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                <Field required type="email" label="Work email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <Field type="tel" label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Field required label="Delivery address" value={form.delivery_address} onChange={(v) => setForm({ ...form, delivery_address: v })} />
                <Field required label="City" value={form.delivery_city} onChange={(v) => setForm({ ...form, delivery_city: v })} />
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="input-label text-xs">State *</label><select required className="input-field py-2.5" value={form.delivery_state} onChange={(e) => setForm({ ...form, delivery_state: e.target.value })}><option value="">Select</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select></div>
                  <Field required label="ZIP" value={form.delivery_zip} onChange={(v) => setForm({ ...form, delivery_zip: v })} />
                </div>
              </div>
              <div><label className="input-label text-xs">Notes <span className="text-gray-600">(optional)</span></label><textarea className="input-field min-h-20 resize-y" value={form.customer_notes} onChange={(e) => setForm({ ...form, customer_notes: e.target.value })} placeholder="PO number, dock hours, or anything else" /></div>
              {status === "error" && <p role="alert" className="text-sm text-red-400">{message}</p>}
              <button disabled={status === "submitting" || !quoteItems.length} className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed">{status === "submitting" ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Request my quote"}</button>
              <p className="flex gap-2 text-[11px] leading-relaxed text-gray-500"><ShieldCheck size={14} className="shrink-0 mt-0.5" />No payment is collected. We verify compatibility, availability, and delivered freight before confirming your order.</p>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <div><label className="input-label text-xs">{label}</label><select aria-label={label} className="input-field py-2.5" value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></div>;
}

function Field({ label, value, onChange, required, type = "text" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  return <div><label className="input-label text-xs">{label}{required ? " *" : ""}</label><input required={required} type={type} className="input-field py-2.5" value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
