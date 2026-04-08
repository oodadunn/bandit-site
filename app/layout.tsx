import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Bandit Recycling — Baler Repair & Bale Wire Supply | Nationwide Service",
    template: "%s | Bandit Recycling",
  },
  description:
    "Professional baler repair, preventive maintenance, and bale wire supply nationwide across all 50 states. Same-day service available. All makes and models.",
  keywords: [
    "baler repair", "bale wire", "baler maintenance", "vertical baler repair",
    "horizontal baler repair", "emergency baler repair", "baler service nationwide",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bandit-theme');if(t==='light')document.documentElement.classList.add('light')}catch(e){}})();`,
          }}
        />
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
              description: "B2B baler repair, maintenance, and bale wire supply nationwide.",
              url: "https://banditrecycling.com",
              telephone: "+18574226348",
              email: "service@banditrecycling.com",
              areaServed: "United States",
              serviceType: ["Baler Repair", "Baler Maintenance", "Bale Wire Supply", "Equipment Leasing"],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <Nav />
        <main className="pt-16">{children}</main>
        <Footer />
        <div dangerouslySetInnerHTML={{ __html: '<elevenlabs-convai agent-id="agent_4701kndtkt4cer3tpb4333c9ytmc"></elevenlabs-convai>' }} />
        <Script src="https://unpkg.com/@elevenlabs/convai-widget-embed" strategy="afterInteractive" />
      </body>
    </html>
  );
}
