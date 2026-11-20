"use client";

import { useState } from "react";

type Suffix = { id: string; value: string; meaning?: string | null; notes?: string | null };
type Place = { id: string; name: string; region?: string | null; notes?: string | null };

interface Props {
  initialSuffixes: Suffix[];
  initialPlaces: Place[];
  isAdmin: boolean;
}

const inputClass = "border px-2 py-1 text-xs outline-none transition-colors duration-150 bg-transparent";
const inputStyle = { borderColor: "#2d2926", color: "#dfd8cc" };

function focusAmber(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#c8a06a";
}
function blurDark(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#2d2926";
}

// ── Suffix panel ─────────────────────────────────────────────────────────────

function SuffixPanel({ initial, isAdmin }: { initial: Suffix[]; isAdmin: boolean }) {
  const [items, setItems] = useState<Suffix[]>(initial);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [newValue, setNewValue] = useState("");
  const [newMeaning, setNewMeaning] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [editValue, setEditValue] = useState("");
  const [editMeaning, setEditMeaning] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!newValue.trim()) return;
    setSaving(true);
    const res = await fetch("/api/inspiration/suffixes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: newValue, meaning: newMeaning, notes: newNotes }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((p) => [...p, item].sort((a, b) => a.value.localeCompare(b.value)));
      setNewValue(""); setNewMeaning(""); setNewNotes(""); setAdding(false);
    }
    setSaving(false);
  }

  function startEdit(item: Suffix) {
    setEditId(item.id);
    setEditValue(item.value);
    setEditMeaning(item.meaning ?? "");
    setEditNotes(item.notes ?? "");
  }

  async function handleSave(id: string) {
    setSaving(true);
    const res = await fetch(`/api/inspiration/suffixes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: editValue, meaning: editMeaning, notes: editNotes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((p) => p.map((x) => x.id === id ? updated : x).sort((a, b) => a.value.localeCompare(b.value)));
      setEditId(null);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette terminaison ?")) return;
    const res = await fetch(`/api/inspiration/suffixes/${id}`, { method: "DELETE" });
    if (res.ok) setItems((p) => p.filter((x) => x.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-3 border-b mb-0" style={{ borderColor: "#2d2926" }}>
        <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.4rem", color: "#dfd8cc", fontWeight: 600 }}>
          Terminaisons
          <span className="ml-2 text-xs" style={{ color: "#8a837a", fontFamily: "var(--font-inter)", fontWeight: 400 }}>
            ({items.length})
          </span>
        </h2>
        {isAdmin && !adding && (
          <button onClick={() => setAdding(true)}
            className="text-xs tracking-widest uppercase" style={{ color: "#c8a06a", letterSpacing: "0.15em" }}>
            + Ajouter
          </button>
        )}
      </div>

      {/* Add form */}
      {adding && isAdmin && (
        <div className="flex gap-2 py-3 border-b" style={{ borderColor: "#1e1c1a" }}>
          <input autoFocus placeholder="Terminaison *" value={newValue} onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className={inputClass} style={{ ...inputStyle, width: "100px" }}
            onFocus={focusAmber} onBlur={blurDark} />
          <input placeholder="Sens / usage" value={newMeaning} onChange={(e) => setNewMeaning(e.target.value)}
            className={inputClass + " flex-1"} style={inputStyle}
            onFocus={focusAmber} onBlur={blurDark} />
          <input placeholder="Notes" value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
            className={inputClass + " flex-1"} style={inputStyle}
            onFocus={focusAmber} onBlur={blurDark} />
          <button onClick={handleAdd} disabled={saving || !newValue.trim()}
            className="text-xs px-3 border disabled:opacity-40"
            style={{ borderColor: "#c8a06a", color: "#c8a06a" }}>
            {saving ? "..." : "OK"}
          </button>
          <button onClick={() => setAdding(false)} className="text-xs" style={{ color: "#8a837a" }}>
            Annuler
          </button>
        </div>
      )}

      {/* Table header */}
      <div className="grid text-xs py-2 border-b" style={{ gridTemplateColumns: "120px 1fr 1fr auto", borderColor: "#2d2926" }}>
        <span style={{ color: "#8a837a", letterSpacing: "0.1em" }}>TERMINAISON</span>
        <span style={{ color: "#8a837a", letterSpacing: "0.1em" }}>SENS / USAGE</span>
        <span style={{ color: "#8a837a", letterSpacing: "0.1em" }}>NOTES</span>
        <span />
      </div>

      {items.length === 0 && (
        <p className="text-xs italic py-6" style={{ color: "#3a3632" }}>Aucune terminaison</p>
      )}

      {items.map((item) => (
        <div key={item.id} className="grid py-2.5 border-b items-center gap-2"
          style={{ gridTemplateColumns: "120px 1fr 1fr auto", borderColor: "#1e1c1a" }}>
          {editId === item.id ? (
            <>
              <input value={editValue} onChange={(e) => setEditValue(e.target.value)}
                className={inputClass} style={{ ...inputStyle, width: "100px" }}
                onFocus={focusAmber} onBlur={blurDark} />
              <input value={editMeaning} onChange={(e) => setEditMeaning(e.target.value)}
                className={inputClass + " w-full"} style={inputStyle}
                onFocus={focusAmber} onBlur={blurDark} />
              <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                className={inputClass + " w-full"} style={inputStyle}
                onFocus={focusAmber} onBlur={blurDark} />
              <div className="flex gap-2">
                <button onClick={() => handleSave(item.id)} disabled={saving}
                  className="text-xs" style={{ color: "#c8a06a" }}>
                  {saving ? "..." : "OK"}
                </button>
                <button onClick={() => setEditId(null)} className="text-xs" style={{ color: "#8a837a" }}>✕</button>
              </div>
            </>
          ) : (
            <>
              <span style={{ color: "#dfd8cc", fontFamily: "var(--font-cormorant)", fontSize: "1rem" }}>
                {item.value}
              </span>
              <span className="text-xs" style={{ color: "#c8c2b8" }}>{item.meaning ?? ""}</span>
              <span className="text-xs italic" style={{ color: "#8a837a" }}>{item.notes ?? ""}</span>
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => startEdit(item)} className="text-xs" style={{ color: "#8a837a" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#c8a06a")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs" style={{ color: "#8a837a" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#a05050")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>
                    ✕
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Place panel ───────────────────────────────────────────────────────────────

function PlacePanel({ initial, isAdmin }: { initial: Place[]; isAdmin: boolean }) {
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
      setItems((p) => [...p, item].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName(""); setNewRegion(""); setNewNotes(""); setAdding(false);
    }
    setSaving(false);
  }

  function startEdit(item: Place) {
    setEditId(item.id);
    setEditName(item.name);
    setEditRegion(item.region ?? "");
    setEditNotes(item.notes ?? "");
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
      setItems((p) => p.map((x) => x.id === id ? updated : x).sort((a, b) => a.name.localeCompare(b.name)));
      setEditId(null);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce lieu ?")) return;
    const res = await fetch(`/api/inspiration/places/${id}`, { method: "DELETE" });
    if (res.ok) setItems((p) => p.filter((x) => x.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-3 border-b mb-0" style={{ borderColor: "#2d2926" }}>
        <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.4rem", color: "#dfd8cc", fontWeight: 600 }}>
          Lieux réels
          <span className="ml-2 text-xs" style={{ color: "#8a837a", fontFamily: "var(--font-inter)", fontWeight: 400 }}>
            ({items.length})
          </span>
        </h2>
        {isAdmin && !adding && (
          <button onClick={() => setAdding(true)}
            className="text-xs tracking-widest uppercase" style={{ color: "#c8a06a", letterSpacing: "0.15em" }}>
            + Ajouter
          </button>
        )}
      </div>

      {/* Add form */}
      {adding && isAdmin && (
        <div className="flex gap-2 py-3 border-b" style={{ borderColor: "#1e1c1a" }}>
          <input autoFocus placeholder="Lieu *" value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className={inputClass} style={{ ...inputStyle, width: "120px" }}
            onFocus={focusAmber} onBlur={blurDark} />
          <input placeholder="Région / pays" value={newRegion} onChange={(e) => setNewRegion(e.target.value)}
            className={inputClass} style={{ ...inputStyle, width: "120px" }}
            onFocus={focusAmber} onBlur={blurDark} />
          <input placeholder="Notes" value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
            className={inputClass + " flex-1"} style={inputStyle}
            onFocus={focusAmber} onBlur={blurDark} />
          <button onClick={handleAdd} disabled={saving || !newName.trim()}
            className="text-xs px-3 border disabled:opacity-40"
            style={{ borderColor: "#c8a06a", color: "#c8a06a" }}>
            {saving ? "..." : "OK"}
          </button>
          <button onClick={() => setAdding(false)} className="text-xs" style={{ color: "#8a837a" }}>
            Annuler
          </button>
        </div>
      )}

      {/* Table header */}
      <div className="grid text-xs py-2 border-b" style={{ gridTemplateColumns: "150px 130px 1fr auto", borderColor: "#2d2926" }}>
        <span style={{ color: "#8a837a", letterSpacing: "0.1em" }}>LIEU</span>
        <span style={{ color: "#8a837a", letterSpacing: "0.1em" }}>RÉGION</span>
        <span style={{ color: "#8a837a", letterSpacing: "0.1em" }}>NOTES</span>
        <span />
      </div>

      {items.length === 0 && (
        <p className="text-xs italic py-6" style={{ color: "#3a3632" }}>Aucun lieu</p>
      )}

      {items.map((item) => (
        <div key={item.id} className="grid py-2.5 border-b items-center gap-2"
          style={{ gridTemplateColumns: "150px 130px 1fr auto", borderColor: "#1e1c1a" }}>
          {editId === item.id ? (
            <>
              <input value={editName} onChange={(e) => setEditName(e.target.value)}
                className={inputClass + " w-full"} style={inputStyle}
                onFocus={focusAmber} onBlur={blurDark} />
              <input value={editRegion} onChange={(e) => setEditRegion(e.target.value)}
                className={inputClass + " w-full"} style={inputStyle}
                onFocus={focusAmber} onBlur={blurDark} />
              <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                className={inputClass + " w-full"} style={inputStyle}
                onFocus={focusAmber} onBlur={blurDark} />
              <div className="flex gap-2">
                <button onClick={() => handleSave(item.id)} disabled={saving}
                  className="text-xs" style={{ color: "#c8a06a" }}>
                  {saving ? "..." : "OK"}
                </button>
                <button onClick={() => setEditId(null)} className="text-xs" style={{ color: "#8a837a" }}>✕</button>
              </div>
            </>
          ) : (
            <>
              <span style={{ color: "#dfd8cc", fontFamily: "var(--font-cormorant)", fontSize: "1rem" }}>
                {item.name}
              </span>
              <span className="text-xs" style={{ color: "#8a837a" }}>{item.region ?? ""}</span>
              <span className="text-xs italic" style={{ color: "#8a837a" }}>{item.notes ?? ""}</span>
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => startEdit(item)} className="text-xs" style={{ color: "#8a837a" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#c8a06a")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs" style={{ color: "#8a837a" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#a05050")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>
                    ✕
                  </button>
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

export default function InspirationClient({ initialSuffixes, initialPlaces, isAdmin }: Props) {
  return (
    <div className="pt-20 px-10 py-10">
      <div className="flex gap-14 items-start">
        <div className="flex-1 min-w-0">
          <SuffixPanel initial={initialSuffixes} isAdmin={isAdmin} />
        </div>
        <div className="flex-1 min-w-0">
          <PlacePanel initial={initialPlaces} isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
}
