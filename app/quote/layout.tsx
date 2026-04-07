import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Free Quote | Bandit Recycling",
  description:
    "Request a free baler service quote. Our nationwide technicians respond within 2 hours. Repair, maintenance, equipment sales & leasing available across all 50 states.",
};

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
