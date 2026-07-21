import type { Metadata } from "next";
import WireOrderBuilder from "@/components/WireOrderBuilder";

export const metadata: Metadata = {
  title: "Bale Wire Prices & Quote Builder",
  description: "Browse bale tie and box wire pricing, match wire to your baler, and request a delivered quote. Freight is quoted separately.",
};

export default function WireOrderPage() {
  return <WireOrderBuilder />;
}
