import type { Metadata } from "next";
import OrderHistory from "@/components/OrderHistory";

export const metadata: Metadata = {
  title: "Wire Order History",
  description: "Access past Bandit wire quote requests and reorder for the same equipment and delivery location.",
  robots: { index: false, follow: false },
};

export default function OrderHistoryPage() {
  return <OrderHistory />;
}
