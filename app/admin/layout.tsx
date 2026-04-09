import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Bandit Recycling",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <style>{`
        nav, footer, .elevenlabs-convai, [data-elevenlabs] { display: none !important; }
        main.pt-16 { padding-top: 0 !important; }
      `}</style>
      {children}
    </div>
  );
}
