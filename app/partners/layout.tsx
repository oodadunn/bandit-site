import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Partner — Bandit Recycling",
  description:
    "Join the Bandit partner network as a 3rd-party baler service provider. Grow your business with steady leads, flexible scheduling, and industry support across the country.",
  keywords: [
    "partner program",
    "baler service partner",
    "baler network",
    "recycling partner",
    "independent contractor",
  ],
  openGraph: {
    title: "Become a Partner — Bandit Recycling",
    description:
      "Join the Bandit partner network and grow your baler service business with steady leads and support.",
    type: "website",
  },
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
