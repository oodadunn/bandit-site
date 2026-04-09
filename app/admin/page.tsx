"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.ok) {
        window.location.href = "/admin/dashboard";
      } else {
        setError(data.error || "Invalid password");
        setPassword("");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <style>{`
        nav, footer, .elevenlabs-convai, [data-elevenlabs] { display: none !important; }
      `}</style>

      <div
        className="w-full max-w-md p-8 rounded-lg shadow-2xl border"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-default)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: "var(--green-accent)" }}>
            BANDIT
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
            Recycling Admin
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Admin Access
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-md border focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: "var(--bg-input)",
                borderColor: "var(--border-input)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--green-accent)";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(57, 255, 20, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-input)";
                e.currentTarget.style.boxShadow = "none";
              }}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div
              className="p-3 rounded-md text-sm font-medium"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderColor: "rgba(239, 68, 68, 0.3)",
                borderWidth: "1px",
                color: "#EF4444",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 font-bold rounded-md transition-all active:scale-95 cursor-pointer"
            style={{
              backgroundColor: "var(--green-accent)",
              color: "var(--green-dark)",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "Authenticating..." : "Access Dashboard"}
          </button>
        </form>

        <p
          className="text-xs text-center mt-6"
          style={{ color: "var(--text-tertiary)" }}
        >
          Secure admin access. Password required.
        </p>
      </div>
    </div>
  );
}
