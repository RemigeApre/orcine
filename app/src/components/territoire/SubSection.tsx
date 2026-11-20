"use client";

import { useState } from "react";

interface Props {
  title: string;
  children: React.ReactNode;
  count?: number;
}

export default function SubSection({ title, children, count }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t" style={{ borderColor: "#2d2926" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.15em" }}>
          {title}
          {count !== undefined && (
            <span className="ml-2 px-1.5 py-0.5 border text-xs" style={{ borderColor: "#2d2926", color: "#8a837a" }}>
              {count}
            </span>
          )}
        </span>
        <span className="text-xs" style={{ color: "#8a837a" }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
}
