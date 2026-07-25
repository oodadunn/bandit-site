"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, LogOut, Mail, Package, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";

type OrderItem = { id: string; product_id: string; product_name: string; package_label: string; unit_price: number; quantity: number; line_total: number };
type Order = {
  id: string; created_at: string; status: string; product_subtotal: number; freight_status: string;
  delivery_address: string; delivery_city: string; delivery_state: string; delivery_zip: string;
  equipment_make?: string; equipment_model?: string; wire_order_items: OrderItem[];
};

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
const STATUS_LABELS: Record<string, string> = {
  quote_requested: "Request received",
  quote_sent: "Quote sent",
  confirmed: "Confirmed",
  fulfilled: "Completed",
  cancelled: "Cancelled",
};
const statusLabel = (status: string) => STATUS_LABELS[status] ?? status.split("_").join(" ");

export default function OrderHistory() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [signedInEmail, setSignedInEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true); setError("");
    const { data } = await supabase.auth.getSession();
    if (!data.session) { setSignedInEmail(""); setLoading(false); return; }
    setSignedInEmail(data.session.user.email ?? "");
    const response = await fetch("/api/wire-quotes", { headers: { Authorization: `Bearer ${data.session.access_token}` } });
    const result = await response.json();
    if (!response.ok) setError(result.error || "Could not load order history."); else setOrders(result.orders ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
    const { data } = supabase.auth.onAuthStateChange(() => loadOrders());
    return () => data.subscription.unsubscribe();
  }, [loadOrders]);

  const sendLink = async (event: React.FormEvent) => {
    event.preventDefault(); setSending(true); setError("");
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/account/orders`,
        shouldCreateUser: true,
      },
    });
    setSending(false);
    if (authError) setError(authError.message); else setSent(true);
  };

  const reorder = (order: Order) => {
    localStorage.setItem("bandit-wire-reorder", JSON.stringify({
      lines: Object.fromEntries(order.wire_order_items.map((item) => [item.product_id, item.quantity])),
      form: {
        delivery_address: order.delivery_address, delivery_city: order.delivery_city,
        delivery_state: order.delivery_state, delivery_zip: order.delivery_zip,
        equipment_make: order.equipment_make ?? "", equipment_model: order.equipment_model ?? "",
        email: signedInEmail,
      },
    }));
    router.push("/wire/order");
  };

  if (loading) return <div className="min-h-[60vh] bg-[#0A0A0A] grid place-items-center"><Loader2 className="animate-spin text-[#39FF14]" size={30} /></div>;

  if (!signedInEmail) return (
    <section className="min-h-[70vh] bg-[#0A0A0A] py-20">
      <div className="container-site max-w-xl">
        <div className="card-dark p-7 sm:p-10">
          <Mail className="text-[#39FF14] mb-6" size={34} />
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">Create or access your account.</h1>
          <p className="text-gray-400 leading-relaxed mb-8">Enter the work email used on your order request. We&apos;ll create a free account or sign you in with a secure email link—no password required.</p>
          {sent ? <div className="bg-[#39FF14]/10 border border-[#39FF14]/25 rounded-lg p-5"><div className="flex gap-3"><CheckCircle className="text-[#39FF14] shrink-0" /><div><p className="font-semibold text-white">Check your email to finish</p><p className="text-sm text-gray-400 mt-1">Open the secure link we sent to {email}. Your saved requests will be waiting.</p></div></div></div> : <form onSubmit={sendLink} className="space-y-4"><div><label className="input-label">Work email</label><input required type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" /></div><button disabled={sending} className="btn-primary w-full">{sending ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Create or access my account"}</button></form>}
          {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
          <p className="text-xs text-gray-600 mt-5">The link only grants access to requests associated with that verified email address.</p>
        </div>
      </div>
    </section>
  );

  return (
    <section className="min-h-[70vh] bg-[#0A0A0A] py-16">
      <div className="container-site">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
          <div><h1 className="text-4xl font-black text-white mb-2">My wire orders</h1><p className="text-gray-400">Signed in as {signedInEmail}</p></div>
          <button onClick={() => supabase.auth.signOut()} className="text-sm text-gray-400 hover:text-white flex items-center gap-2"><LogOut size={15} /> Sign out</button>
        </div>
        {error && <p className="text-red-400 mb-6">{error}</p>}
        {!orders.length ? <div className="card-dark text-center py-14"><Package size={36} className="text-gray-600 mx-auto mb-4" /><h2 className="text-xl font-bold text-white mb-2">No wire requests yet</h2><p className="text-gray-400 mb-6">When you submit a wire order request with this email, it will appear here.</p><Link href="/wire/order" className="btn-primary">Start a wire order</Link></div> : <div className="space-y-5">{orders.map((order) => <article key={order.id} className="border border-white/10 rounded-xl bg-[#111] overflow-hidden">
          <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10">
            <div><div className="flex flex-wrap items-center gap-2"><p className="text-xs text-gray-500 font-mono">REQUEST {order.id.slice(0,8).toUpperCase()}</p><span className="rounded-full border border-[#39FF14]/20 bg-[#39FF14]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#39FF14]">{statusLabel(order.status)}</span></div><h2 className="text-lg font-bold text-white mt-2">{new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</h2><p className="text-sm text-gray-400 mt-1">{order.delivery_city}, {order.delivery_state} {order.delivery_zip}{order.equipment_make ? ` · ${order.equipment_make} ${order.equipment_model ?? ""}` : ""}</p></div>
            <div className="flex items-center gap-5"><div className="text-right"><p className="text-xs text-gray-500">Product subtotal</p><p className="text-xl font-bold text-white">{money(Number(order.product_subtotal))}</p><p className="text-xs text-[#39FF14]">Freight quoted separately</p></div><button onClick={() => reorder(order)} className="btn-primary"><RotateCcw size={15} /> Reorder</button></div>
          </div>
          <div className="divide-y divide-white/5">{order.wire_order_items.map((item) => <div key={item.id} className="px-5 sm:px-6 py-4 flex justify-between gap-4 text-sm"><div><p className="text-white font-medium">{item.product_name}</p><p className="text-gray-500 text-xs mt-1">{item.package_label}</p></div><p className="text-gray-300 shrink-0">{item.quantity} x {money(Number(item.unit_price))}</p></div>)}</div>
        </article>)}</div>}
      </div>
    </section>
  );
}
