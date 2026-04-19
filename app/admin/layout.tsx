import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Bandit Recycling",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <style>{`
        /* Hide public site chrome inside the admin section. Target specific
           layout elements the site uses — header (Nav.tsx), footer, and the
           ElevenLabs call widget. Do NOT hit generic <nav> since the admin
           sidebar may use semantic nav tags. */
        body > header,
        body > footer,
        .elevenlabs-convai,
        [data-elevenlabs] { display: none !important; }
        main.pt-16 { padding-top: 0 !important; }
      `}</style>
      {children}
    </div>
  );
}
