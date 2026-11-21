"use client";

import { useState } from "react";

type MorphemeType = "PREFIXE" | "SUFFIXE" | "MOT";
type MorphemeOrigin = "LATIN" | "GERMANIQUE" | "CELTE" | "NORDIQUE" | "GREC" | "ARABE" | "AUTRE";

type Morpheme = {
  id: string;
  value: string;
  type: MorphemeType;
  origin: MorphemeOrigin;
  notes?: string | null;
};

type Theme = {
  id: string;
  name: string;
  notes?: string | null;
  morphemes: Morpheme[];
};

type Place = { id: string; name: string; region?: string | null; notes?: string | null };

interface Props {
  initialThemes: Theme[];
  initialPlaces: Place[];
  isAdmin: boolean;
}

const ORIGINS: { value: MorphemeOrigin; label: string }[] = [
  { value: "LATIN", label: "Latin" },
  { value: "GERMANIQUE", label: "Germanique" },
  { value: "CELTE", label: "Celte / Gaulois" },
  { value: "NORDIQUE", label: "Nordique" },
  { value: "GREC", label: "Grec" },
  { value: "ARABE", label: "Arabe" },
  { value: "AUTRE", label: "Autre" },
];

const TYPES: { value: MorphemeType; label: string }[] = [
  { value: "SUFFIXE", label: "Suffixe" },
  { value: "PREFIXE", label: "Préfixe" },
  { value: "MOT", label: "Mot seul" },
];

const ORIGIN_COLORS: Record<MorphemeOrigin, string> = {
  LATIN:      "#c8a06a",
  GERMANIQUE: "#9ab0c0",
  CELTE:      "#8ab090",
  NORDIQUE:   "#a090b8",
  GREC:       "#c0a888",
  ARABE:      "#b8906a",
  AUTRE:      "#8a837a",
};

function displayMorpheme(m: Morpheme): string {
  if (m.type === "SUFFIXE") return `-${m.value}`;
  if (m.type === "PREFIXE") return `${m.value}-`;
  return m.value;
}

const inputClass = "border px-2 py-1 text-xs outline-none transition-colors duration-150 bg-transparent";
const inputStyle = { borderColor: "#2d2926", color: "#dfd8cc" };
function focusAmber(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) { e.currentTarget.style.borderColor = "#c8a06a"; }
function blurDark(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) { e.currentTarget.style.borderColor = "#2d2926"; }

// ── Theme card ────────────────────────────────────────────────────────────────

function ThemeCard({ theme, isAdmin, onDelete, onAddMorpheme, onDeleteMorpheme }: {
  theme: Theme;
  isAdmin: boolean;
  onDelete: () => void;
  onAddMorpheme: (m: Morpheme) => void;
  onDeleteMorpheme: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState<MorphemeType>("SUFFIXE");
  const [newOrigin, setNewOrigin] = useState<MorphemeOrigin>("LATIN");
  const [saving, setSaving] = useState(false);

  async function handleAddMorpheme() {
    if (!newValue.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/inspiration/themes/${theme.id}/morphemes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: newValue, type: newType, origin: newOrigin }),
    });
    if (res.ok) {
      const m = await res.json();
      onAddMorpheme(m);
      setNewValue("");
      setAdding(false);
    }
    setSaving(false);
  }

  async function handleDeleteMorpheme(id: string) {
    const res = await fetch(`/api/inspiration/themes/${theme.id}/morphemes/${id}`, { method: "DELETE" });
    if (res.ok) onDeleteMorpheme(id);
  }

  // Group morphemes by origin
  const byOrigin = ORIGINS.map(o => ({
    origin: o,
    items: theme.morphemes.filter(m => m.origin === o.value),
  })).filter(g => g.items.length > 0);

  return (
    <div className="border flex flex-col overflow-hidden"
      style={{ borderColor: "#2d2926", backgroundColor: "#171614" }}>

      {/* Card header */}
      <div className="flex items-start justify-between px-4 py-3 border-b" style={{ borderColor: "#2d2926" }}>
        <h3 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.2rem", color: "#dfd8cc", fontWeight: 600, lineHeight: 1.2 }}>
          {theme.name}
        </h3>
        {isAdmin && (
          <div className="flex gap-3 ml-3 shrink-0 pt-0.5">
            <button onClick={() => setAdding(p => !p)}
              className="text-xs" style={{ color: adding ? "#c8a06a" : "#8a837a" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#c8a06a")}
              onMouseLeave={(e) => { if (!adding) e.currentTarget.style.color = "#8a837a"; }}>
              + morphème
            </button>
            <button onClick={onDelete} className="text-xs" style={{ color: "#8a837a" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a05050")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Add morpheme form */}
      {adding && isAdmin && (
        <div className="flex flex-col gap-2 px-4 py-3 border-b" style={{ borderColor: "#1e1c1a", backgroundColor: "#0f0e0d" }}>
          <input autoFocus placeholder="Valeur *" value={newValue} onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddMorpheme()}
            className={inputClass + " w-full"} style={inputStyle}
            onFocus={focusAmber} onBlur={blurDark} />
          <div className="flex gap-2">
            <select value={newType} onChange={(e) => setNewType(e.target.value as MorphemeType)}
              className={inputClass + " flex-1"} style={{ ...inputStyle, color: "#dfd8cc" }}
              onFocus={focusAmber} onBlur={blurDark}>
              {TYPES.map(t => (
                <option key={t.value} value={t.value} style={{ backgroundColor: "#1c1a18" }}>{t.label}</option>
              ))}
            </select>
            <select value={newOrigin} onChange={(e) => setNewOrigin(e.target.value as MorphemeOrigin)}
              className={inputClass + " flex-1"} style={{ ...inputStyle, color: "#dfd8cc" }}
              onFocus={focusAmber} onBlur={blurDark}>
              {ORIGINS.map(o => (
                <option key={o.value} value={o.value} style={{ backgroundColor: "#1c1a18" }}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddMorpheme} disabled={saving || !newValue.trim()}
              className="text-xs px-3 py-1 border disabled:opacity-40"
              style={{ borderColor: "#c8a06a", color: "#c8a06a" }}>
              {saving ? "..." : "Ajouter"}
            </button>
            <button onClick={() => setAdding(false)} className="text-xs" style={{ color: "#8a837a" }}>Annuler</button>
          </div>
        </div>
      )}

      {/* Morphemes grouped by origin */}
      <div className="flex flex-col gap-3 px-4 py-3 flex-1">
        {byOrigin.length === 0 && (
          <p className="text-xs italic" style={{ color: "#3a3632" }}>Aucun morphème</p>
        )}
        {byOrigin.map(({ origin, items }) => (
          <div key={origin.value}>
            <span className="text-xs tracking-widest uppercase block mb-1.5"
              style={{ color: ORIGIN_COLORS[origin.value], letterSpacing: "0.12em", fontSize: "0.65rem" }}>
              {origin.label}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {items.map(m => (
                <span key={m.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 border text-xs group"
                  style={{ borderColor: "#2d2926", backgroundColor: "#0f0e0d" }}>
                  <span style={{ color: "#c8c2b8", fontFamily: "var(--font-cormorant)", fontSize: "0.95rem" }}>
                    {displayMorpheme(m)}
                  </span>
                  {isAdmin && (
                    <button onClick={() => handleDeleteMorpheme(m.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs leading-none"
                      style={{ color: "#a05050" }}>
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {theme.notes && (
        <div className="px-4 py-2 border-t" style={{ borderColor: "#1e1c1a" }}>
          <p className="text-xs italic" style={{ color: "#8a837a" }}>{theme.notes}</p>
        </div>
      )}
    </div>
  );
}

// ── Morphologie panel ─────────────────────────────────────────────────────────

function MorphologiePanel({ initial, isAdmin }: { initial: Theme[]; isAdmin: boolean }) {
  const [themes, setThemes] = useState<Theme[]>(initial);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAddTheme() {
    if (!newName.trim()) return;
    setSaving(true);
    const res = await fetch("/api/inspiration/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, notes: newNotes }),
    });
    if (res.ok) {
      const t = await res.json();
      setThemes(p => [...p, t].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName(""); setNewNotes(""); setAdding(false);
    }
    setSaving(false);
  }

  return (
    <div>
      {/* Add theme form */}
      {adding && isAdmin && (
        <div className="flex gap-2 mb-6 items-end">
          <div className="flex flex-col gap-2">
            <input autoFocus placeholder="Concept / sens *" value={newName} onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTheme()}
              className={inputClass} style={{ ...inputStyle, width: "200px" }}
              onFocus={focusAmber} onBlur={blurDark} />
            <input placeholder="Notes (optionnel)" value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
              className={inputClass} style={{ ...inputStyle, width: "200px" }}
              onFocus={focusAmber} onBlur={blurDark} />
          </div>
          <button onClick={handleAddTheme} disabled={saving || !newName.trim()}
            className="text-xs px-4 py-2 border disabled:opacity-40"
            style={{ borderColor: "#c8a06a", color: "#c8a06a" }}>
            {saving ? "..." : "Créer"}
          </button>
          <button onClick={() => setAdding(false)} className="text-xs" style={{ color: "#8a837a" }}>Annuler</button>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>

        {/* Add card */}
        {isAdmin && !adding && (
          <button onClick={() => setAdding(true)}
            className="flex flex-col items-center justify-center border-2 border-dashed transition-colors duration-200"
            style={{ borderColor: "#2d2926", minHeight: "120px", color: "#8a837a" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2d2926")}>
            <span style={{ fontSize: "1.6rem", color: "#c8a06a" }}>+</span>
            <span className="mt-1 text-xs tracking-widest uppercase" style={{ letterSpacing: "0.15em" }}>
              Nouveau concept
            </span>
          </button>
        )}

        {themes.map(theme => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isAdmin={isAdmin}
            onDelete={async () => {
              if (!confirm(`Supprimer "${theme.name}" et tous ses morphèmes ?`)) return;
              const res = await fetch(`/api/inspiration/themes/${theme.id}`, { method: "DELETE" });
              if (res.ok) setThemes(p => p.filter(t => t.id !== theme.id));
            }}
            onAddMorpheme={(m) => setThemes(p => p.map(t =>
              t.id === theme.id ? { ...t, morphemes: [...t.morphemes, m] } : t
            ))}
            onDeleteMorpheme={(mId) => setThemes(p => p.map(t =>
              t.id === theme.id ? { ...t, morphemes: t.morphemes.filter(m => m.id !== mId) } : t
            ))}
          />
        ))}
      </div>

      {themes.length === 0 && !adding && (
        <p className="text-xs italic mt-6" style={{ color: "#3a3632" }}>
          Aucun concept. Commencez par en créer un.
        </p>
      )}
    </div>
  );
}

// ── Places panel ──────────────────────────────────────────────────────────────

function PlacesPanel({ initial, isAdmin }: { initial: Place[]; isAdmin: boolean }) {
  const [items, setItems] = useState<Place[]>(initial);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [editName, setEditName] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!newName.trim()) return;
    setSaving(true);
    const res = await fetch("/api/inspiration/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, region: newRegion, notes: newNotes }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems(p => [...p, item].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName(""); setNewRegion(""); setNewNotes(""); setAdding(false);
    }
    setSaving(false);
  }

  function startEdit(item: Place) {
    setEditId(item.id); setEditName(item.name);
    setEditRegion(item.region ?? ""); setEditNotes(item.notes ?? "");
  }

  async function handleSave(id: string) {
    setSaving(true);
    const res = await fetch(`/api/inspiration/places/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, region: editRegion, notes: editNotes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems(p => p.map(x => x.id === id ? updated : x).sort((a, b) => a.name.localeCompare(b.name)));
      setEditId(null);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce lieu ?")) return;
    const res = await fetch(`/api/inspiration/places/${id}`, { method: "DELETE" });
    if (res.ok) setItems(p => p.filter(x => x.id !== id));
  }

  return (
    <div>
      {isAdmin && !adding && (
        <button onClick={() => setAdding(true)}
          className="text-xs tracking-widest uppercase mb-5 inline-block"
          style={{ color: "#c8a06a", letterSpacing: "0.15em" }}>
          + Ajouter un lieu
        </button>
      )}

      {adding && isAdmin && (
        <div className="flex gap-2 mb-5 flex-wrap items-end">
          <input autoFocus placeholder="Lieu *" value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className={inputClass} style={{ ...inputStyle, width: "150px" }}
            onFocus={focusAmber} onBlur={blurDark} />
          <input placeholder="Région / pays" value={newRegion} onChange={(e) => setNewRegion(e.target.value)}
            className={inputClass} style={{ ...inputStyle, width: "150px" }}
            onFocus={focusAmber} onBlur={blurDark} />
          <input placeholder="Notes" value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
            className={inputClass} style={{ ...inputStyle, width: "200px" }}
            onFocus={focusAmber} onBlur={blurDark} />
          <button onClick={handleAdd} disabled={saving || !newName.trim()}
            className="text-xs px-3 py-1 border disabled:opacity-40"
            style={{ borderColor: "#c8a06a", color: "#c8a06a" }}>
            {saving ? "..." : "OK"}
          </button>
          <button onClick={() => setAdding(false)} className="text-xs" style={{ color: "#8a837a" }}>Annuler</button>
        </div>
      )}

      <div className="grid text-xs py-2 border-b" style={{ gridTemplateColumns: "180px 150px 1fr auto", borderColor: "#2d2926" }}>
        {["LIEU", "RÉGION", "NOTES", ""].map((h, i) => (
          <span key={i} style={{ color: "#8a837a", letterSpacing: "0.1em" }}>{h}</span>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-xs italic py-6" style={{ color: "#3a3632" }}>Aucun lieu réel</p>
      )}

      {items.map(item => (
        <div key={item.id} className="grid py-2.5 border-b items-center gap-2"
          style={{ gridTemplateColumns: "180px 150px 1fr auto", borderColor: "#1e1c1a" }}>
          {editId === item.id ? (
            <>
              <input value={editName} onChange={(e) => setEditName(e.target.value)}
                className={inputClass + " w-full"} style={inputStyle} onFocus={focusAmber} onBlur={blurDark} />
              <input value={editRegion} onChange={(e) => setEditRegion(e.target.value)}
                className={inputClass + " w-full"} style={inputStyle} onFocus={focusAmber} onBlur={blurDark} />
              <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                className={inputClass + " w-full"} style={inputStyle} onFocus={focusAmber} onBlur={blurDark} />
              <div className="flex gap-2">
                <button onClick={() => handleSave(item.id)} disabled={saving}
                  className="text-xs" style={{ color: "#c8a06a" }}>{saving ? "..." : "OK"}</button>
                <button onClick={() => setEditId(null)} className="text-xs" style={{ color: "#8a837a" }}>✕</button>
              </div>
            </>
          ) : (
            <>
              <span style={{ color: "#dfd8cc", fontFamily: "var(--font-cormorant)", fontSize: "1rem" }}>{item.name}</span>
              <span className="text-xs" style={{ color: "#8a837a" }}>{item.region ?? ""}</span>
              <span className="text-xs italic" style={{ color: "#8a837a" }}>{item.notes ?? ""}</span>
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => startEdit(item)} className="text-xs" style={{ color: "#8a837a" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#c8a06a")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>Modifier</button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs" style={{ color: "#8a837a" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#a05050")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>✕</button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

type Tab = "morphologie" | "lieux";

export default function InspirationClient({ initialThemes, initialPlaces, isAdmin }: Props) {
  const [tab, setTab] = useState<Tab>("morphologie");

  return (
    <div className="pt-20 px-10 py-10">
      {/* Sub-navigation */}
      <div className="flex gap-8 mb-8 border-b pb-4" style={{ borderColor: "#2d2926" }}>
        {(["morphologie", "lieux"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="text-xs tracking-widest uppercase transition-colors duration-150"
            style={{
              letterSpacing: "0.18em",
              fontFamily: "var(--font-inter)",
              color: tab === t ? "#dfd8cc" : "#8a837a",
              borderBottom: tab === t ? "1px solid #c8a06a" : "1px solid transparent",
              paddingBottom: "4px",
            }}>
            {t === "morphologie" ? "Morphologie" : "Lieux réels"}
          </button>
        ))}
      </div>

      {tab === "morphologie" && <MorphologiePanel initial={initialThemes} isAdmin={isAdmin} />}
      {tab === "lieux" && <PlacesPanel initial={initialPlaces} isAdmin={isAdmin} />}
    </div>
  );
}
