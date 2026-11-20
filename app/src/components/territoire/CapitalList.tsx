"use client";

import { useState } from "react";
import type { Capital, TerritoryRef } from "./types";
import DateFields from "./DateFields";

interface Props {
  capitals: Capital[];
  apiBase: string;
  isAdmin: boolean;
  territories: TerritoryRef[];
  onAdd: (c: Capital) => void;
  onDelete: (id: string) => void;
  onUpdate: (c: Capital) => void;
}

const EMPTY = { territoryId: "", startValue: "", startLabel: "", endValue: "", endLabel: "", notes: "" };

export default function CapitalList({ capitals, apiBase, isAdmin, territories, onAdd, onDelete, onUpdate }: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(key: string, value: string) { setForm((p) => ({ ...p, [key]: value })); }

  function startEdit(c: Capital) {
    setEditId(c.id);
    setForm({
      territoryId: c.territoryId,
      startValue: c.startValue?.toString() ?? "",
      startLabel: c.startLabel ?? "",
      endValue: c.endValue?.toString() ?? "",
      endLabel: c.endLabel ?? "",
      notes: c.notes ?? "",
    });
  }

  async function handleSave() {
    if (!form.territoryId) return;
    setLoading(true);
    const payload = {
      ...(editId ? { id: editId } : {}),
      territoryId: form.territoryId,
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
      const territory = territories.find((t) => t.id === form.territoryId)!;
      editId ? onUpdate({ ...data, territory }) : onAdd({ ...data, territory });
      setForm({ ...EMPTY });
      setEditId(null);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {capitals.length === 0 && <p className="text-xs italic" style={{ color: "#8a837a" }}>Aucune capitale</p>}
      {capitals.map((c) => (
        <div key={c.id} className="p-3 border flex items-start justify-between gap-2" style={{ borderColor: "#2d2926" }}>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm" style={{ color: "#dfd8cc", fontFamily: "var(--font-cormorant)", fontSize: "1.05rem" }}>
              {c.territory.name}
            </span>
            <span className="text-xs" style={{ color: "#8a837a" }}>
              {c.startLabel || (c.startValue != null ? `An ${c.startValue}` : "?")}
              {" → "}
              {c.endLabel || (c.endValue != null ? `An ${c.endValue}` : "En cours")}
            </span>
            {c.notes && <span className="text-xs mt-0.5" style={{ color: "#8a837a" }}>{c.notes}</span>}
          </div>
          {isAdmin && (
            <div className="flex gap-3 shrink-0">
              <button onClick={() => startEdit(c)} className="text-xs" style={{ color: "#c8a06a" }}>Modifier</button>
              <button onClick={async () => {
                await fetch(apiBase, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id }) });
                onDelete(c.id);
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
            <label className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.1em" }}>Territoire *</label>
            <select value={form.territoryId} onChange={(e) => set("territoryId", e.target.value)}
              className="border px-3 py-2 text-sm outline-none bg-transparent"
              style={{ borderColor: "#2d2926", color: form.territoryId ? "#dfd8cc" : "#8a837a" }}>
              <option value="" style={{ backgroundColor: "#1c1a18" }}>Choisir un territoire</option>
              {territories.map((t) => (
                <option key={t.id} value={t.id} style={{ backgroundColor: "#1c1a18" }}>
                  {t.type ? `${t.type.name} - ` : ""}{t.name}
                </option>
              ))}
            </select>
          </div>
          <DateFields startLabel="Debut" endLabel="Fin"
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
            <button onClick={handleSave} disabled={loading || !form.territoryId}
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
