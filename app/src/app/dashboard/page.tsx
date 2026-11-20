import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import SettingsLink from "@/components/SettingsLink";

const MENU = [
  { label: "Identite", href: "/identite" },
  { label: "Territoire", href: "/territoire" },
  { label: "Chronologie", href: "/chronologie" },
];

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <main className="flex flex-col items-center justify-center min-h-screen relative">
      <div className="absolute top-6 right-6 flex items-center gap-4">
        {session.role === "ADMIN" && <SettingsLink />}
        <LogoutButton />
      </div>

      <h1
        className="text-5xl font-light mb-20"
        style={{ fontFamily: "var(--font-cormorant)", color: "#dfd8cc", letterSpacing: "0.25em" }}
      >
        Orcine
      </h1>

      <nav className="flex flex-col items-center gap-5">
        {MENU.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm uppercase tracking-widest transition-colors duration-200 text-muted hover:text-text"
            style={{ fontFamily: "var(--font-inter)", letterSpacing: "0.2em" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
