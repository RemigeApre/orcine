"use client";

import { useState } from "react";
import type { Regime, PoliticalSystem } from "./types";
import DateFields from "./DateFields";

interface Props {
  regimes: Regime[];
  apiBase: string;
  isAdmin: boolean;
  politicalSystems: PoliticalSystem[];
  onAdd: (r: Regime) => void;
  onDelete: (id: string) => void;
  onUpdate: (r: Regime) => void;
}

const EMPTY = { politicalSystemId: "", startValue: "", startLabel: "", endValue: "", endLabel: "", notes: "" };

export default function RegimeList({ regimes, apiBase, isAdmin, politicalSystems, onAdd, onDelete, onUpdate }: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(key: string, value: string) { setForm((p) => ({ ...p, [key]: value })); }

  function startEdit(r: Regime) {
    setEditId(r.id);
    setForm({
      politicalSystemId: r.politicalSystemId,
      startValue: r.startValue?.toString() ?? "",
      startLabel: r.startLabel ?? "",
      endValue: r.endValue?.toString() ?? "",
      endLabel: r.endLabel ?? "",
      notes: r.notes ?? "",
    });
  }

  async function handleSave() {
    if (!form.politicalSystemId) return;
    setLoading(true);
    const payload = {
      ...(editId ? { id: editId } : {}),
      politicalSystemId: form.politicalSystemId,
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
      const ps = politicalSystems.find((p) => p.id === form.politicalSystemId)!;
      editId ? onUpdate({ ...data, politicalSystem: ps }) : onAdd({ ...data, politicalSystem: ps });
      setForm({ ...EMPTY });
      setEditId(null);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {regimes.length === 0 && <p className="text-xs italic" style={{ color: "#8a837a" }}>Aucun regime</p>}
      {regimes.map((r) => (
        <div key={r.id} className="p-3 border flex items-start justify-between gap-2" style={{ borderColor: "#2d2926" }}>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm" style={{ color: "#dfd8cc" }}>{r.politicalSystem.name}</span>
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
            <label className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.1em" }}>Regime *</label>
            <select value={form.politicalSystemId} onChange={(e) => set("politicalSystemId", e.target.value)}
              className="border px-3 py-2 text-sm outline-none bg-transparent"
              style={{ borderColor: "#2d2926", color: form.politicalSystemId ? "#dfd8cc" : "#8a837a" }}>
              <option value="" style={{ backgroundColor: "#1c1a18" }}>Choisir un regime</option>
              {politicalSystems.map((ps) => (
                <option key={ps.id} value={ps.id} style={{ backgroundColor: "#1c1a18" }}>{ps.name}</option>
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
            <button onClick={handleSave} disabled={loading || !form.politicalSystemId}
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
