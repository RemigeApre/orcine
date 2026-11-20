"use client";

import { useState } from "react";

interface Props {
  title: string;
  children: React.ReactNode;
  count?: number;
  defaultOpen?: boolean;
}

export default function SubSection({ title, children, count, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-7">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between pb-2 border-b text-left"
        style={{ borderColor: "#2d2926" }}
      >
        <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.15rem", color: "#dfd8cc", fontWeight: 600 }}>
          {title}
          {count !== undefined && (
            <span className="ml-2 text-xs" style={{ color: "#8a837a", fontFamily: "var(--font-inter)", fontWeight: 400 }}>
              ({count})
            </span>
          )}
        </span>
        <span className="text-xs transition-transform duration-200" style={{ color: "#8a837a", transform: open ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>
          &#8964;
        </span>
      </button>
      {open && <div className="pt-4">{children}</div>}
    </div>
  );
}
