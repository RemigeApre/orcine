"use client";

import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import SettingsLink from "@/components/SettingsLink";

interface Props {
  title: string;
  isAdmin?: boolean;
}

export default function PageHeader({ title, isAdmin }: Props) {
  return (
    <header
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-8 py-5 border-b"
      style={{ borderColor: "#2d2926", backgroundColor: "#0f0e0d" }}
    >
      <Link
        href="/dashboard"
        className="text-xs tracking-widest uppercase transition-colors duration-200"
        style={{ color: "#8a837a", letterSpacing: "0.15em", fontFamily: "var(--font-inter)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#dfd8cc")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}
      >
        &#8592; Orcine
      </Link>
      <span
        className="text-sm tracking-widest uppercase"
        style={{ color: "#dfd8cc", letterSpacing: "0.2em", fontFamily: "var(--font-inter)" }}
      >
        {title}
      </span>
      <div className="flex items-center gap-4">
        {isAdmin && <SettingsLink />}
        <LogoutButton />
      </div>
    </header>
  );
}
