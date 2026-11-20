import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1
        className="text-7xl font-light mb-16 select-none"
        style={{ fontFamily: "var(--font-cormorant)", color: "#dfd8cc", letterSpacing: "0.3em" }}
      >
        Orcine
      </h1>
      <Link
        href="/login"
        className="px-8 py-3 border border-border text-muted text-sm uppercase tracking-widest transition-colors duration-200 hover:border-accent hover:text-text"
        style={{ fontFamily: "var(--font-inter)", letterSpacing: "0.2em" }}
      >
        Se connecter
      </Link>
    </main>
  );
}
