"use client";

import { useState } from "react";
import type { Ruler, IdentityRef } from "./types";
import DateFields from "./DateFields";

interface Props {
  rulers: Ruler[];
  apiBase: string;
  isAdmin: boolean;
  identities: IdentityRef[];
  onAdd: (r: Ruler) => void;
  onDelete: (id: string) => void;
  onUpdate: (r: Ruler) => void;
}

const EMPTY = { identityId: "", title: "", startValue: "", startLabel: "", endValue: "", endLabel: "", notes: "" };

export default function RulerList({ rulers, apiBase, isAdmin, identities, onAdd, onDelete, onUpdate }: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(key: string, value: string) { setForm((p) => ({ ...p, [key]: value })); }

  function startEdit(r: Ruler) {
    setEditId(r.id);
    setForm({
      identityId: r.identityId,
      title: r.title ?? "",
      startValue: r.startValue?.toString() ?? "",
      startLabel: r.startLabel ?? "",
      endValue: r.endValue?.toString() ?? "",
      endLabel: r.endLabel ?? "",
      notes: r.notes ?? "",
    });
  }

  async function handleSave() {
    if (!form.identityId) return;
    setLoading(true);
    const payload = {
      ...(editId ? { id: editId } : {}),
      identityId: form.identityId,
      title: form.title || null,
      startValue: form.startValue ? parseInt(form.startValue) : null,
      startLabel: form.startLabel || null,
      endValue: form.endValue ? parseInt(form.endValue) : null,
      endLabel: form.endLabel || null,
      notes: form.notes || null,
    };
    const res = await fetch(apiBase, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      const identity = identities.find((i) => i.id === form.identityId)!;
      editId ? onUpdate({ ...data, identity }) : onAdd({ ...data, identity });
      setForm({ ...EMPTY });
      setEditId(null);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {rulers.length === 0 && <p className="text-xs italic" style={{ color: "#8a837a" }}>Aucun dirigeant</p>}
      {rulers.map((r) => (
        <div key={r.id} className="p-3 border flex items-start justify-between gap-2" style={{ borderColor: "#2d2926" }}>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm" style={{ color: "#dfd8cc", fontFamily: "var(--font-cormorant)", fontSize: "1.05rem" }}>
              {r.title ? `${r.title} ` : ""}{r.identity.name}
            </span>
            <span className="text-xs" style={{ color: "#8a837a" }}>
              {r.startLabel || (r.startValue != null ? `An ${r.startValue}` : "?")}
              {" → "}
              {r.endLabel || (r.endValue != null ? `An ${r.endValue}` : "En cours")}
            </span>
            {r.notes && <span className="text-xs mt-0.5" style={{ color: "#8a837a" }}>{r.notes}</span>}
          </div>
          {isAdmin && (
            <div className="flex gap-3 shrink-0">
              <button onClick={() => startEdit(r)} className="text-xs" style={{ color: "#c8a06a" }}>Modifier</button>
              <button onClick={async () => {
                await fetch(apiBase, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id }) });
                onDelete(r.id);
              }} className="text-xs transition-colors duration-150" style={{ color: "#8a837a" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#a05050")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>
                Supprimer
              </button>
            </div>
          )}
        </div>
      ))}

      {isAdmin && (
        <div className="flex flex-col gap-3 pt-3 border-t" style={{ borderColor: "#2d2926" }}>
          <div className="flex flex-col gap-1">
            <label className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.1em" }}>Identite *</label>
            <select value={form.identityId} onChange={(e) => set("identityId", e.target.value)}
              className="border px-3 py-2 text-sm outline-none bg-transparent"
              style={{ borderColor: "#2d2926", color: form.identityId ? "#dfd8cc" : "#8a837a" }}>
              <option value="" style={{ backgroundColor: "#1c1a18" }}>Choisir une identite</option>
              {identities.map((i) => (
                <option key={i.id} value={i.id} style={{ backgroundColor: "#1c1a18" }}>{i.name}</option>
              ))}
            </select>
          </div>
          <input type="text" placeholder="Titre (Roi, Duc, Empress...)" value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="border px-3 py-2 text-sm outline-none transition-colors duration-150 bg-transparent"
            style={{ borderColor: "#2d2926", color: "#dfd8cc" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")} />
          <DateFields startLabel="Debut de regne" endLabel="Fin de regne"
            startValue={form.startValue} startText={form.startLabel}
            endValue={form.endValue} endText={form.endLabel}
            onChange={set} />
          <input type="text" placeholder="Notes (optionnel)" value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className="border px-3 py-2 text-sm outline-none transition-colors duration-150 bg-transparent"
            style={{ borderColor: "#2d2926", color: "#dfd8cc" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")} />
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={loading || !form.identityId}
              className="px-5 py-2 border text-xs tracking-widest uppercase disabled:opacity-40"
              style={{ borderColor: "#c8a06a", color: "#c8a06a", letterSpacing: "0.15em" }}>
              {loading ? "..." : editId ? "Enregistrer" : "Ajouter"}
            </button>
            {editId && (
              <button onClick={() => { setEditId(null); setForm({ ...EMPTY }); }}
                className="px-5 py-2 border text-xs tracking-widest uppercase"
                style={{ borderColor: "#2d2926", color: "#8a837a", letterSpacing: "0.15em" }}>
                Annuler
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
