import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Baler Equipment Sales & Leasing | Bandit Recycling",
  description:
    "Buy or lease vertical balers, horizontal balers, waste compactors, and conveyor systems. New and used equipment nationwide. Flexible leasing terms available.",
};

export default function EquipmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
