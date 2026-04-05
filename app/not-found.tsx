import Link from "next/link";
import { Phone, Home, Wrench } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="text-center max-w-xl">

        {/* Raccoon character */}
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-[#39FF14]/5 rounded-full blur-3xl scale-110" />
          <img
            src="/bandit-face.png"
            alt="Bandit the confused raccoon"
            className="relative w-48 h-auto mx-auto drop-shadow-[0_0_40px_rgba(57,255,20,0.2)]"
          />
        </div>

        {/* 404 */}
        <div className="text-8xl font-black text-[#39FF14]/20 font-mono leading-none mb-2">404</div>

        <h1 className="text-3xl font-black text-white mb-4">
          Bandit tipped this page over.
        </h1>

        {/* Bandit quote */}
        <div className="flex gap-3 items-start p-4 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-xl mb-8 text-left">
          <img src="/bandit-circle.png" alt="Bandit" className="w-8 h-8 shrink-0 mt-0.5" />
          <div>
            <div className="text-[#39FF14] text-xs font-mono font-bold mb-1">BANDIT SAYS</div>
            <p className="text-gray-300 text-sm leading-relaxed italic">
              &ldquo;I was looking for food and knocked this page into the dumpster. My bad. Try one of the links below — unless you were looking for a snack, in which case you&apos;re on your own.&rdquo;
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            <Home size={16} /> Back to Home
          </Link>
          <Link href="/services/baler-repair" className="btn-ghost-green">
            <Wrench size={16} /> Baler Repair
          </Link>
          <a href="tel:+18002263481" className="btn-secondary">
            <Phone size={16} /> Call Us
          </a>
        </div>

      </div>
    </div>
  );
}
