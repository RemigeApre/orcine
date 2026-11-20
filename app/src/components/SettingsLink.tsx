import Link from "next/link";

export default function SettingsLink() {
  return (
    <Link
      href="/admin"
      className="text-xs tracking-widest uppercase transition-colors duration-200"
      style={{ color: "#8a837a", letterSpacing: "0.15em", fontFamily: "var(--font-inter)" }}
    >
      Parametres
    </Link>
  );
}
