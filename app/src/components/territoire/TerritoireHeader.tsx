"use client";

import LogoutButton from "@/components/LogoutButton";
import SettingsLink from "@/components/SettingsLink";

interface Props {
  backLabel: string;
  onBack: () => void;
  isAdmin: boolean;
  entityName?: string | null;
}

export default function TerritoireHeader({ backLabel, onBack, isAdmin, entityName }: Props) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-5 border-b"
      style={{ borderColor: "#2d2926", backgroundColor: "#0f0e0d" }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm transition-colors duration-200 text-muted hover:text-text"
        style={{ fontFamily: "var(--font-inter)", letterSpacing: "0.05em" }}
      >
        <span>&#8592;</span>
        <span>{backLabel}</span>
      </button>

      <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
        {entityName && (
          <>
            <span
              className="text-sm"
              style={{ color: "#dfd8cc", fontFamily: "var(--font-cormorant)", fontSize: "1.1rem" }}
            >
              {entityName}
            </span>
            <span style={{ color: "#2d2926" }}>·</span>
          </>
        )}
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "#8a837a", letterSpacing: "0.2em", fontFamily: "var(--font-inter)" }}
        >
          An 649 depuis l&apos;unification
        </span>
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && <SettingsLink />}
        <LogoutButton />
      </div>
    </header>
  );
}
