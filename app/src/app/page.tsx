import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1
        className="text-7xl font-light tracking-widest mb-16 select-none"
        style={{ fontFamily: "var(--font-cormorant)", color: "#dfd8cc", letterSpacing: "0.3em" }}
      >
        Orcine
      </h1>
      <Link
        href="/login"
        className="px-8 py-3 border text-sm tracking-widest uppercase transition-colors duration-200"
        style={{
          borderColor: "#2d2926",
          color: "#8a837a",
          fontFamily: "var(--font-inter)",
          letterSpacing: "0.2em",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "#c8a06a";
          (e.currentTarget as HTMLAnchorElement).style.color = "#dfd8cc";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "#2d2926";
          (e.currentTarget as HTMLAnchorElement).style.color = "#8a837a";
        }}
      >
        Se connecter
      </Link>
    </main>
  );
}
