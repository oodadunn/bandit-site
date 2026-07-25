import type { Metadata } from "next";
import OrderHistory from "@/components/OrderHistory";

export const metadata: Metadata = {
  title: "My Wire Orders",
  description: "Create or access your Bandit account, view past wire order requests, and reorder for the same equipment and delivery location.",
  robots: { index: false, follow: false },
};

export default function OrderHistoryPage() {
  return <OrderHistory />;
}
