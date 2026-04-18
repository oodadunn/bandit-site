import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Free Quote | Bandit Recycling",
  description:
    "Request a free baler service quote. Nationwide technicians, 24/7 emergency dispatch. Repair, maintenance, equipment sales & leasing across all 50 states.",
};

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
