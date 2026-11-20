"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs tracking-widest uppercase transition-colors duration-200"
      style={{ color: "#8a837a", letterSpacing: "0.15em", fontFamily: "var(--font-inter)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#dfd8cc")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}
    >
      Quitter
    </button>
  );
}
