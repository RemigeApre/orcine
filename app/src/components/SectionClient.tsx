"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea";
  required?: boolean;
}

interface Item {
  id: string;
  [key: string]: string | number | Date | null | undefined;
}

interface Props {
  items: Item[];
  apiBase: string;
  isAdmin: boolean;
  fields: FieldDef[];
  titleKey?: string;
  subtitleKey?: string;
}

const EMPTY_FORM = (fields: FieldDef[]) =>
  Object.fromEntries(fields.map((f) => [f.key, ""]));

export default function SectionClient({
  items: initialItems,
  apiBase,
  isAdmin,
  fields,
  titleKey = "name",
  subtitleKey,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [selected, setSelected] = useState<Item | null>(null);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const openItem = (item: Item) => {
    setSelected(item);
    setEditing(false);
    setCreating(false);
    setError("");
  };

  const openCreate = () => {
    setSelected(null);
    setCreating(true);
    setEditing(false);
    setForm(EMPTY_FORM(fields));
    setError("");
  };

  const openEdit = (item: Item) => {
    setEditing(true);
    setCreating(false);
    setForm(Object.fromEntries(fields.map((f) => [f.key, String(item[f.key] ?? "")])));
    setError("");
  };

  const closePanel = () => {
    setSelected(null);
    setEditing(false);
    setCreating(false);
    setError("");
  };

  const handleSave = useCallback(async () => {
    setLoading(true);
    setError("");

    const url = editing && selected ? `${apiBase}/${selected.id}` : apiBase;
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erreur");
      return;
    }

    router.refresh();

    if (editing && selected) {
      setItems((prev) => prev.map((i) => (i.id === selected.id ? { ...i, ...data } : i)));
      setSelected({ ...selected, ...data });
      setEditing(false);
    } else {
      setItems((prev) => [...prev, data]);
      setCreating(false);
      setSelected(data);
    }
  }, [editing, selected, apiBase, form, router]);

  const handleDelete = useCallback(async (item: Item) => {
    if (!confirm(`Supprimer "${String(item[titleKey])}" ?`)) return;
    setLoading(true);

    const res = await fetch(`${apiBase}/${item.id}`, { method: "DELETE" });
    setLoading(false);

    if (!res.ok) {
      setError("Erreur lors de la suppression");
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== item.id));
    if (selected?.id === item.id) closePanel();
    router.refresh();
  }, [apiBase, selected, titleKey, router]);

  const panelOpen = selected || creating;

  return (
    <div className="pt-20 min-h-screen flex">
      {/* Liste */}
      <div
        className="flex flex-col border-r transition-all duration-200"
        style={{
          borderColor: "#2d2926",
          width: panelOpen ? "320px" : "100%",
          minWidth: panelOpen ? "280px" : undefined,
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#2d2926" }}>
          <span className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.15em" }}>
            {items.length} {items.length === 1 ? "entree" : "entrees"}
          </span>
          {isAdmin && (
            <button
              onClick={openCreate}
              className="text-xs tracking-widest uppercase transition-colors duration-200"
              style={{ color: "#c8a06a", letterSpacing: "0.15em" }}
            >
              + Ajouter
            </button>
          )}
        </div>

        <ul className="flex-1 overflow-y-auto">
          {items.length === 0 && (
            <li className="px-6 py-8 text-center text-sm" style={{ color: "#8a837a" }}>
              Aucune entree
            </li>
          )}
          {items.map((item) => (
            <li
              key={item.id}
              onClick={() => openItem(item)}
              className="flex items-start justify-between px-6 py-4 cursor-pointer border-b transition-colors duration-150"
              style={{
                borderColor: "#1e1c1a",
                backgroundColor: selected?.id === item.id ? "#1c1a18" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (selected?.id !== item.id)
                  (e.currentTarget as HTMLLIElement).style.backgroundColor = "#171614";
              }}
              onMouseLeave={(e) => {
                if (selected?.id !== item.id)
                  (e.currentTarget as HTMLLIElement).style.backgroundColor = "transparent";
              }}
            >
              <div className="flex flex-col gap-0.5 overflow-hidden">
                <span
                  className="text-sm truncate"
                  style={{ color: "#dfd8cc", fontFamily: "var(--font-cormorant)", fontSize: "1.05rem" }}
                >
                  {String(item[titleKey] ?? "")}
                </span>
                {subtitleKey && item[subtitleKey] && (
                  <span className="text-xs" style={{ color: "#8a837a" }}>
                    {String(item[subtitleKey])}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Panneau detail / edition / creation */}
      {panelOpen && (
        <div className="flex-1 flex flex-col overflow-y-auto px-10 py-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={closePanel}
              className="text-xs tracking-widest uppercase transition-colors duration-200"
              style={{ color: "#8a837a", letterSpacing: "0.15em" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#dfd8cc")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}
            >
              Fermer
            </button>

            {isAdmin && selected && !editing && (
              <div className="flex gap-5">
                <button
                  onClick={() => openEdit(selected)}
                  className="text-xs tracking-widest uppercase transition-colors duration-200"
                  style={{ color: "#c8a06a", letterSpacing: "0.15em" }}
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(selected)}
                  disabled={loading}
                  className="text-xs tracking-widest uppercase transition-colors duration-200 disabled:opacity-40"
                  style={{ color: "#a05050", letterSpacing: "0.15em" }}
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>

          {/* Lecture */}
          {selected && !editing && (
            <div className="flex flex-col gap-7 max-w-2xl">
              {fields.map((field) => (
                <div key={field.key} className="flex flex-col gap-2">
                  <span
                    className="text-xs tracking-widest uppercase"
                    style={{ color: "#8a837a", letterSpacing: "0.15em" }}
                  >
                    {field.label}
                  </span>
                  <p
                    style={{
                      color: "#dfd8cc",
                      fontFamily: field.key === titleKey ? "var(--font-cormorant)" : "var(--font-inter)",
                      fontSize: field.key === titleKey ? "1.6rem" : "0.9rem",
                      lineHeight: "1.7",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {String(selected[field.key] ?? "") || (
                      <span style={{ color: "#8a837a", fontStyle: "italic" }}>Vide</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Formulaire (creation ou edition) */}
          {(editing || creating) && (
            <form
              onSubmit={(e) => { e.preventDefault(); handleSave(); }}
              className="flex flex-col gap-5 max-w-2xl"
            >
              {fields.map((field) => (
                <div key={field.key} className="flex flex-col gap-2">
                  <label
                    className="text-xs tracking-widest uppercase"
                    style={{ color: "#8a837a", letterSpacing: "0.15em" }}
                  >
                    {field.label}
                    {field.required && <span style={{ color: "#c8a06a" }}> *</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={form[field.key] ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                      rows={5}
                      className="bg-transparent border px-4 py-3 text-sm outline-none transition-colors duration-150 resize-y"
                      style={{ borderColor: "#2d2926", color: "#dfd8cc", fontFamily: "var(--font-inter)", lineHeight: "1.7" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[field.key] ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                      required={field.required}
                      className="bg-transparent border px-4 py-3 text-sm outline-none transition-colors duration-150"
                      style={{ borderColor: "#2d2926", color: "#dfd8cc", fontFamily: "var(--font-inter)" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
                    />
                  )}
                </div>
              ))}

              {error && (
                <p className="text-xs" style={{ color: "#a05050" }}>{error}</p>
              )}

              <div className="flex gap-4 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 border text-xs tracking-widest uppercase transition-colors duration-200 disabled:opacity-40"
                  style={{ borderColor: "#c8a06a", color: "#c8a06a", letterSpacing: "0.2em" }}
                >
                  {loading ? "..." : creating ? "Creer" : "Enregistrer"}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setCreating(false); if (creating) closePanel(); }}
                  className="px-6 py-2.5 border text-xs tracking-widest uppercase transition-colors duration-200"
                  style={{ borderColor: "#2d2926", color: "#8a837a", letterSpacing: "0.2em" }}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
