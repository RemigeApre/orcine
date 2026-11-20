"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erreur de connexion");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1
        className="text-4xl font-light mb-12 tracking-widest"
        style={{ fontFamily: "var(--font-cormorant)", letterSpacing: "0.25em" }}
      >
        Orcine
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-xs"
      >
        <input
          type="text"
          placeholder="Identifiant"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          className="bg-transparent border px-4 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted"
          style={{ borderColor: "#2d2926", color: "#dfd8cc", fontFamily: "var(--font-inter)" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="bg-transparent border px-4 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted"
          style={{ borderColor: "#2d2926", color: "#dfd8cc", fontFamily: "var(--font-inter)" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
        />

        {error && (
          <p className="text-xs text-center" style={{ color: "#a05050" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 px-8 py-3 border text-sm tracking-widest uppercase transition-colors duration-200 disabled:opacity-40"
          style={{ borderColor: "#c8a06a", color: "#c8a06a", fontFamily: "var(--font-inter)", letterSpacing: "0.2em" }}
        >
          {loading ? "..." : "Entrer"}
        </button>
      </form>
    </main>
  );
}
