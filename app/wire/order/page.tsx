import type { Metadata } from "next";
import WireOrderBuilder from "@/components/WireOrderBuilder";

export const metadata: Metadata = {
  title: "Bale Wire Prices & Order Form",
  description: "Browse bale tie and box wire pricing, submit an order request, and save it to your account for easy reordering. Freight is quoted separately.",
};

export default function WireOrderPage() {
  return <WireOrderBuilder />;
}
