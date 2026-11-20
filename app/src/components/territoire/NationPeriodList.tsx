"use client";

import { useState } from "react";
import type { TerritoryNationPeriod, NationRef } from "./types";
import DateFields from "./DateFields";

interface Props {
  nationPeriods: TerritoryNationPeriod[];
  apiBase: string;
  isAdmin: boolean;
  nations: NationRef[];
  onAdd: (p: TerritoryNationPeriod) => void;
  onDelete: (id: string) => void;
  onUpdate: (p: TerritoryNationPeriod) => void;
}

const RELATION_TYPES = ["DIRECT", "VASSAL", "AUTONOMOUS"] as const;
const LABELS: Record<string, string> = { DIRECT: "Direct", VASSAL: "Vassal", AUTONOMOUS: "Autonome" };

const EMPTY = { nationId: "", relationType: "DIRECT", startValue: "", startLabel: "", endValue: "", endLabel: "", notes: "" };

export default function NationPeriodList({ nationPeriods, apiBase, isAdmin, nations, onAdd, onDelete, onUpdate }: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(key: string, value: string) { setForm((p) => ({ ...p, [key]: value })); }

  function startEdit(p: TerritoryNationPeriod) {
    setEditId(p.id);
    setForm({
      nationId: p.nationId ?? "",
      relationType: p.relationType,
      startValue: p.startValue?.toString() ?? "",
      startLabel: p.startLabel ?? "",
      endValue: p.endValue?.toString() ?? "",
      endLabel: p.endLabel ?? "",
      notes: p.notes ?? "",
    });
  }

  async function handleSave() {
    setLoading(true);
    const payload = {
      ...(editId ? { id: editId } : {}),
      nationId: form.nationId || null,
      relationType: form.relationType,
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
      const nation = nations.find((n) => n.id === form.nationId) ?? null;
      editId ? onUpdate({ ...data, nation }) : onAdd({ ...data, nation });
      setForm({ ...EMPTY });
      setEditId(null);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {nationPeriods.length === 0 && <p className="text-xs italic" style={{ color: "#8a837a" }}>Aucune appartenance</p>}
      {nationPeriods.map((p) => (
        <div key={p.id} className="p-3 border flex items-start justify-between gap-2" style={{ borderColor: "#2d2926" }}>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm" style={{ color: "#dfd8cc", fontFamily: "var(--font-cormorant)", fontSize: "1.05rem" }}>
              {p.nation?.name ?? "Independant"}
              <span className="ml-2 text-xs" style={{ color: "#8a837a", fontFamily: "var(--font-inter)" }}>
                ({LABELS[p.relationType]})
              </span>
            </span>
            <span className="text-xs" style={{ color: "#8a837a" }}>
              {p.startLabel || (p.startValue != null ? `An ${p.startValue}` : "?")}
              {" → "}
              {p.endLabel || (p.endValue != null ? `An ${p.endValue}` : "En cours")}
            </span>
            {p.notes && <span className="text-xs mt-0.5" style={{ color: "#8a837a" }}>{p.notes}</span>}
          </div>
          {isAdmin && (
            <div className="flex gap-3 shrink-0">
              <button onClick={() => startEdit(p)} className="text-xs" style={{ color: "#c8a06a" }}>Modifier</button>
              <button onClick={async () => {
                await fetch(apiBase, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id }) });
                onDelete(p.id);
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
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.1em" }}>Nation</label>
              <select value={form.nationId} onChange={(e) => set("nationId", e.target.value)}
                className="border px-3 py-2 text-sm outline-none bg-transparent"
                style={{ borderColor: "#2d2926", color: form.nationId ? "#dfd8cc" : "#8a837a" }}>
                <option value="" style={{ backgroundColor: "#1c1a18" }}>Independant</option>
                {nations.map((n) => (
                  <option key={n.id} value={n.id} style={{ backgroundColor: "#1c1a18" }}>{n.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.1em" }}>Relation</label>
              <select value={form.relationType} onChange={(e) => set("relationType", e.target.value)}
                className="border px-3 py-2 text-sm outline-none bg-transparent"
                style={{ borderColor: "#2d2926", color: "#dfd8cc" }}>
                {RELATION_TYPES.map((t) => (
                  <option key={t} value={t} style={{ backgroundColor: "#1c1a18" }}>{LABELS[t]}</option>
                ))}
              </select>
            </div>
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
            <button onClick={handleSave} disabled={loading}
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
