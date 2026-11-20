"use client";

import { useState } from "react";
import type { Period } from "./types";
import DateFields from "./DateFields";

interface Props {
  periods: Period[];
  apiBase: string;
  isAdmin: boolean;
  onAdd: (p: Period) => void;
  onDelete: (id: string) => void;
  onUpdate: (p: Period) => void;
}

const END_TYPES = ["ONGOING","DISSOLUTION","MERGER","ANNEXATION","INDEPENDENCE","CONQUEST","OTHER"] as const;
const CONTINUITY = ["CONTINUOUS","INTERRUPTED","SPORADIC"] as const;
const LABELS: Record<string, string> = {
  ONGOING: "En cours", DISSOLUTION: "Dissolution", MERGER: "Fusion",
  ANNEXATION: "Annexion", INDEPENDENCE: "Independance", CONQUEST: "Conquete", OTHER: "Autre",
  CONTINUOUS: "Continue", INTERRUPTED: "Interrompue", SPORADIC: "Sporadique",
};

const EMPTY = { startValue: "", startLabel: "", endValue: "", endLabel: "", endType: "ONGOING", continuity: "CONTINUOUS", notes: "" };

export default function PeriodList({ periods, apiBase, isAdmin, onAdd, onDelete, onUpdate }: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function startEdit(p: Period) {
    setEditId(p.id);
    setForm({
      startValue: p.startValue?.toString() ?? "",
      startLabel: p.startLabel ?? "",
      endValue: p.endValue?.toString() ?? "",
      endLabel: p.endLabel ?? "",
      endType: p.endType,
      continuity: p.continuity,
      notes: p.notes ?? "",
    });
  }

  async function handleSave() {
    setLoading(true);
    const payload = {
      ...(editId ? { id: editId } : {}),
      startValue: form.startValue ? parseInt(form.startValue) : null,
      startLabel: form.startLabel || null,
      endValue: form.endValue ? parseInt(form.endValue) : null,
      endLabel: form.endLabel || null,
      endType: form.endType,
      continuity: form.continuity,
      notes: form.notes || null,
    };

    const res = await fetch(apiBase, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      editId ? onUpdate(data) : onAdd(data);
      setForm({ ...EMPTY });
      setEditId(null);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {periods.length === 0 && <p className="text-xs italic" style={{ color: "#8a837a" }}>Aucune periode</p>}
      {periods.map((p) => (
        <div key={p.id} className="p-3 border flex flex-col gap-1" style={{ borderColor: "#2d2926" }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm" style={{ color: "#dfd8cc" }}>
                {p.startLabel || (p.startValue != null ? `An ${p.startValue}` : "Debut inconnu")}
                {" → "}
                {p.endType === "ONGOING" ? "En cours" : (p.endLabel || (p.endValue != null ? `An ${p.endValue}` : "?"))}
              </span>
              <div className="flex gap-3">
                <span className="text-xs" style={{ color: "#8a837a" }}>{LABELS[p.endType]}</span>
                <span className="text-xs" style={{ color: "#8a837a" }}>{LABELS[p.continuity]}</span>
              </div>
              {p.notes && <span className="text-xs mt-1" style={{ color: "#8a837a" }}>{p.notes}</span>}
            </div>
            {isAdmin && (
              <div className="flex gap-3 shrink-0">
                <button onClick={() => startEdit(p)} className="text-xs transition-colors duration-150"
                  style={{ color: "#c8a06a" }}>Modifier</button>
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
        </div>
      ))}

      {isAdmin && (
        <div className="flex flex-col gap-3 pt-3 border-t" style={{ borderColor: "#2d2926" }}>
          <DateFields
            startLabel="Debut" endLabel="Fin"
            startValue={form.startValue} startText={form.startLabel}
            endValue={form.endValue} endText={form.endLabel}
            onChange={set}
          />
          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.1em" }}>Fin de periode</label>
              <select value={form.endType} onChange={(e) => set("endType", e.target.value)}
                className="border px-3 py-2 text-sm outline-none bg-transparent"
                style={{ borderColor: "#2d2926", color: "#dfd8cc" }}>
                {END_TYPES.map((t) => <option key={t} value={t} style={{ backgroundColor: "#1c1a18" }}>{LABELS[t]}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.1em" }}>Continuite</label>
              <select value={form.continuity} onChange={(e) => set("continuity", e.target.value)}
                className="border px-3 py-2 text-sm outline-none bg-transparent"
                style={{ borderColor: "#2d2926", color: "#dfd8cc" }}>
                {CONTINUITY.map((c) => <option key={c} value={c} style={{ backgroundColor: "#1c1a18" }}>{LABELS[c]}</option>)}
              </select>
            </div>
          </div>
          <input type="text" placeholder="Notes (optionnel)" value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className="border px-3 py-2 text-sm outline-none transition-colors duration-150 bg-transparent"
            style={{ borderColor: "#2d2926", color: "#dfd8cc" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")} />
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={loading}
              className="px-5 py-2 border text-xs tracking-widest uppercase transition-colors duration-150 disabled:opacity-40"
              style={{ borderColor: "#c8a06a", color: "#c8a06a", letterSpacing: "0.15em" }}>
              {loading ? "..." : editId ? "Enregistrer" : "Ajouter"}
            </button>
            {editId && (
              <button onClick={() => { setEditId(null); setForm({ ...EMPTY }); }}
                className="px-5 py-2 border text-xs tracking-widest uppercase transition-colors duration-150"
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
