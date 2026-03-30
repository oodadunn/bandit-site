import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Bandit Recycling — Baler Repair & Bale Wire Supply | Southeast US",
    template: "%s | Bandit Recycling",
  },
  description:
    "Professional baler repair, preventive maintenance, and bale wire supply across the Southeast US. Same-day service in GA, FL, AL, SC, NC, TN. All makes and models.",
  keywords: [
    "baler repair", "bale wire", "baler maintenance", "vertical baler repair",
    "horizontal baler repair", "emergency baler repair", "baler service Southeast US",
  ],
  openGraph: {
    siteName: "Bandit Recycling",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Inter+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Bandit Recycling",
              description: "B2B baler repair, maintenance, and bale wire supply across the Southeast US.",
              url: "https://banditrecycling.com",
              telephone: "+18002263481",
              email: "service@banditrecycling.com",
              areaServed: ["Georgia", "Florida", "Alabama", "South Carolina", "North Carolina", "Tennessee"],
              serviceType: ["Baler Repair", "Baler Maintenance", "Bale Wire Supply", "Equipment Leasing"],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <Nav />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
