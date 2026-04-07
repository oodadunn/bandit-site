import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Coverage | All 50 States | Bandit Recycling",
  description: "Nationwide baler repair service with local technicians in all 50 states. Fast response times, same-day emergency dispatch, and preventive maintenance coverage across the US.",
};

export default function ServiceAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
