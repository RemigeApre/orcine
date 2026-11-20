"use client";

import { useState } from "react";
import type { Synonym } from "./types";

interface Props {
  synonyms: Synonym[];
  apiBase: string;
  isAdmin: boolean;
  onAdd: (s: Synonym) => void;
  onDelete: (id: string) => void;
}

export default function SynonymList({ synonyms, apiBase, isAdmin, onAdd, onDelete }: Props) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!value.trim()) return;
    setLoading(true);
    const res = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value.trim() }),
    });
    if (res.ok) {
      onAdd(await res.json());
      setValue("");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await fetch(apiBase, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onDelete(id);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {synonyms.length === 0 && (
          <span className="text-xs italic" style={{ color: "#8a837a" }}>Aucun</span>
        )}
        {synonyms.map((s) => (
          <span key={s.id} className="flex items-center gap-2 px-3 py-1 border text-sm"
            style={{ borderColor: "#2d2926", color: "#dfd8cc" }}>
            {s.name}
            {isAdmin && (
              <button onClick={() => handleDelete(s.id)} className="text-xs transition-colors duration-150"
                style={{ color: "#8a837a" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#a05050")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>
                x
              </button>
            )}
          </span>
        ))}
      </div>
      {isAdmin && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ajouter un synonyme"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="border px-3 py-2 text-sm outline-none transition-colors duration-150 bg-transparent flex-1"
            style={{ borderColor: "#2d2926", color: "#dfd8cc" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
          />
          <button onClick={handleAdd} disabled={loading}
            className="px-4 py-2 border text-xs tracking-widest uppercase transition-colors duration-150 disabled:opacity-40"
            style={{ borderColor: "#c8a06a", color: "#c8a06a", letterSpacing: "0.15em" }}>
            {loading ? "..." : "Ajouter"}
          </button>
        </div>
      )}
    </div>
  );
}
