"use client";

import { useState, useCallback } from "react";
import EntityDetail from "./EntityDetail";
import type {
  NationRef, TerritoryRef, PoliticalSystem, TerritoryType,
  IdentityRef, NationDetail, TerritoryDetail,
} from "./types";

interface Props {
  initialNations: NationRef[];
  initialTerritories: TerritoryRef[];
  politicalSystems: PoliticalSystem[];
  territoryTypes: TerritoryType[];
  identities: IdentityRef[];
  isAdmin: boolean;
}

type Selection =
  | { kind: "nation"; id: string }
  | { kind: "territory"; id: string }
  | { kind: "new-nation" }
  | { kind: "new-territory" }
  | { kind: "settings" }
  | null;

export default function TerritoireClient({
  initialNations, initialTerritories, politicalSystems: initPS,
  territoryTypes: initTT, identities, isAdmin,
}: Props) {
  const [nations, setNations] = useState<NationRef[]>(initialNations);
  const [territories, setTerritories] = useState<TerritoryRef[]>(initialTerritories);
  const [politicalSystems, setPoliticalSystems] = useState<PoliticalSystem[]>(initPS);
  const [territoryTypes, setTerritoryTypes] = useState<TerritoryType[]>(initTT);
  const [selection, setSelection] = useState<Selection>(null);
  const [detail, setDetail] = useState<NationDetail | TerritoryDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // New entity forms
  const [newNationName, setNewNationName] = useState("");
  const [newTerritoryName, setNewTerritoryName] = useState("");
  const [newTerritoryTypeId, setNewTerritoryTypeId] = useState("");
  const [newTerritoryParentId, setNewTerritoryParentId] = useState("");
  const [newTerritoryLevel, setNewTerritoryLevel] = useState("1");
  const [creating, setCreating] = useState(false);

  // Settings forms
  const [newPSName, setNewPSName] = useState("");
  const [newTTName, setNewTTName] = useState("");
  const [savingPS, setSavingPS] = useState(false);
  const [savingTT, setSavingTT] = useState(false);

  async function selectNation(id: string) {
    setSelection({ kind: "nation", id });
    setLoadingDetail(true);
    const res = await fetch(`/api/nations/${id}`);
    if (res.ok) setDetail(await res.json());
    setLoadingDetail(false);
  }

  async function selectTerritory(id: string) {
    setSelection({ kind: "territory", id });
    setLoadingDetail(true);
    const res = await fetch(`/api/territories/${id}`);
    if (res.ok) setDetail(await res.json());
    setLoadingDetail(false);
  }

  async function createNation() {
    if (!newNationName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/nations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newNationName.trim() }),
    });
    if (res.ok) {
      const nation = await res.json();
      setNations((p) => [...p, nation].sort((a, b) => a.name.localeCompare(b.name)));
      setNewNationName("");
      await selectNation(nation.id);
    }
    setCreating(false);
  }

  async function createTerritory() {
    if (!newTerritoryName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/territories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTerritoryName.trim(),
        typeId: newTerritoryTypeId || null,
        level: parseInt(newTerritoryLevel),
        parentId: newTerritoryParentId || null,
      }),
    });
    if (res.ok) {
      const t = await res.json();
      const type = territoryTypes.find((x) => x.id === newTerritoryTypeId) ?? null;
      setTerritories((p) => [...p, { ...t, type }].sort((a, b) => a.name.localeCompare(b.name)));
      setNewTerritoryName("");
      setNewTerritoryTypeId("");
      setNewTerritoryParentId("");
      setNewTerritoryLevel("1");
      await selectTerritory(t.id);
    }
    setCreating(false);
  }

  const handleNationDelete = useCallback((id: string) => {
    setNations((p) => p.filter((n) => n.id !== id));
    setSelection(null);
    setDetail(null);
  }, []);

  const handleTerritoryDelete = useCallback((id: string) => {
    setTerritories((p) => p.filter((t) => t.id !== id));
    setSelection(null);
    setDetail(null);
  }, []);

  const handleIndependence = useCallback(async (territoryId: string) => {
    const res = await fetch(`/api/nations`);
    if (res.ok) {
      const updated = await res.json();
      setNations(updated);
    }
    await selectTerritory(territoryId);
  }, []);

  async function addPS() {
    if (!newPSName.trim()) return;
    setSavingPS(true);
    const res = await fetch("/api/political-systems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPSName.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setPoliticalSystems((p) => [...p, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewPSName("");
    }
    setSavingPS(false);
  }

  async function addTT() {
    if (!newTTName.trim()) return;
    setSavingTT(true);
    const res = await fetch("/api/territory-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTTName.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setTerritoryTypes((p) => [...p, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewTTName("");
    }
    setSavingTT(false);
  }

  const panelOpen = selection !== null;
  const inputClass = "border px-3 py-2 text-sm outline-none transition-colors duration-150 bg-transparent";
  const inputStyle = { borderColor: "#2d2926", color: "#dfd8cc" };

  return (
    <div className="pt-20 min-h-screen flex">
      {/* Sidebar */}
      <div className="flex flex-col border-r overflow-y-auto"
        style={{ borderColor: "#2d2926", width: panelOpen ? "280px" : "340px", minWidth: "240px", flexShrink: 0 }}>

        {/* Nations */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "#2d2926" }}>
          <span className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.15em" }}>
            Nations ({nations.length})
          </span>
          {isAdmin && (
            <button onClick={() => setSelection({ kind: "new-nation" })}
              className="text-xs" style={{ color: "#c8a06a" }}>+ Ajouter</button>
          )}
        </div>
        {nations.map((n) => (
          <button key={n.id} onClick={() => selectNation(n.id)}
            className="text-left px-5 py-3 border-b transition-colors duration-150"
            style={{
              borderColor: "#1e1c1a",
              backgroundColor: selection?.kind === "nation" && selection.id === n.id ? "#1c1a18" : "transparent",
              color: "#dfd8cc",
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.05rem",
            }}
            onMouseEnter={(e) => { if (!(selection?.kind === "nation" && selection.id === n.id)) e.currentTarget.style.backgroundColor = "#171614"; }}
            onMouseLeave={(e) => { if (!(selection?.kind === "nation" && selection.id === n.id)) e.currentTarget.style.backgroundColor = "transparent"; }}>
            {n.name}
          </button>
        ))}

        {/* Territories */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-t mt-2"
          style={{ borderColor: "#2d2926" }}>
          <span className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.15em" }}>
            Territoires ({territories.length})
          </span>
          {isAdmin && (
            <button onClick={() => setSelection({ kind: "new-territory" })}
              className="text-xs" style={{ color: "#c8a06a" }}>+ Ajouter</button>
          )}
        </div>
        {territories.map((t) => (
          <button key={t.id} onClick={() => selectTerritory(t.id)}
            className="text-left px-5 py-3 border-b transition-colors duration-150"
            style={{
              borderColor: "#1e1c1a",
              paddingLeft: `${1.25 + (t.level - 1) * 1}rem`,
              backgroundColor: selection?.kind === "territory" && selection.id === t.id ? "#1c1a18" : "transparent",
              color: "#dfd8cc",
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.05rem",
            }}
            onMouseEnter={(e) => { if (!(selection?.kind === "territory" && selection.id === t.id)) e.currentTarget.style.backgroundColor = "#171614"; }}
            onMouseLeave={(e) => { if (!(selection?.kind === "territory" && selection.id === t.id)) e.currentTarget.style.backgroundColor = "transparent"; }}>
            <div className="flex flex-col gap-0">
              <span>{t.name}</span>
              {t.type && <span className="text-xs" style={{ color: "#8a837a", fontFamily: "var(--font-inter)" }}>{t.type.name}</span>}
            </div>
          </button>
        ))}

        {/* Settings */}
        {isAdmin && (
          <div className="mt-auto border-t p-4" style={{ borderColor: "#2d2926" }}>
            <button onClick={() => setSelection({ kind: "settings" })}
              className="text-xs tracking-widest uppercase transition-colors duration-150 w-full text-left"
              style={{ color: "#8a837a", letterSpacing: "0.15em" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#dfd8cc")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>
              Listes de reference
            </button>
          </div>
        )}
      </div>

      {/* Main panel */}
      {panelOpen && (
        <div className="flex-1 overflow-y-auto px-10 py-8">
          <div className="flex justify-end mb-6">
            <button onClick={() => { setSelection(null); setDetail(null); }}
              className="text-xs tracking-widest uppercase transition-colors duration-150"
              style={{ color: "#8a837a", letterSpacing: "0.15em" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#dfd8cc")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>
              Fermer
            </button>
          </div>

          {/* New nation form */}
          {selection.kind === "new-nation" && (
            <div className="flex flex-col gap-4 max-w-lg">
              <h2 className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.2em" }}>
                Nouvelle nation
              </h2>
              <input type="text" placeholder="Nom *" value={newNationName}
                onChange={(e) => setNewNationName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createNation()}
                className={inputClass + " w-full"}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")} />
              <button onClick={createNation} disabled={creating || !newNationName.trim()}
                className="px-6 py-2.5 border text-xs tracking-widest uppercase disabled:opacity-40 self-start"
                style={{ borderColor: "#c8a06a", color: "#c8a06a", letterSpacing: "0.2em" }}>
                {creating ? "..." : "Creer"}
              </button>
            </div>
          )}

          {/* New territory form */}
          {selection.kind === "new-territory" && (
            <div className="flex flex-col gap-4 max-w-lg">
              <h2 className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.2em" }}>
                Nouveau territoire
              </h2>
              <input type="text" placeholder="Nom *" value={newTerritoryName}
                onChange={(e) => setNewTerritoryName(e.target.value)}
                className={inputClass + " w-full"}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")} />
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.1em" }}>Type</label>
                  <select value={newTerritoryTypeId} onChange={(e) => setNewTerritoryTypeId(e.target.value)}
                    className={inputClass + " w-full"}
                    style={{ ...inputStyle, color: newTerritoryTypeId ? "#dfd8cc" : "#8a837a" }}>
                    <option value="" style={{ backgroundColor: "#1c1a18" }}>Aucun</option>
                    {territoryTypes.map((t) => (
                      <option key={t.id} value={t.id} style={{ backgroundColor: "#1c1a18" }}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1" style={{ width: "80px" }}>
                  <label className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.1em" }}>Niveau</label>
                  <select value={newTerritoryLevel} onChange={(e) => setNewTerritoryLevel(e.target.value)}
                    className={inputClass}
                    style={inputStyle}>
                    {[1, 2, 3, 4, 5].map((l) => (
                      <option key={l} value={l} style={{ backgroundColor: "#1c1a18" }}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.1em" }}>Territoire parent</label>
                <select value={newTerritoryParentId} onChange={(e) => setNewTerritoryParentId(e.target.value)}
                  className={inputClass + " w-full"}
                  style={{ ...inputStyle, color: newTerritoryParentId ? "#dfd8cc" : "#8a837a" }}>
                  <option value="" style={{ backgroundColor: "#1c1a18" }}>Aucun</option>
                  {territories.map((t) => (
                    <option key={t.id} value={t.id} style={{ backgroundColor: "#1c1a18" }}>
                      {t.type ? `${t.type.name} - ` : ""}{t.name}
                    </option>
                  ))}
                </select>
              </div>
              <button onClick={createTerritory} disabled={creating || !newTerritoryName.trim()}
                className="px-6 py-2.5 border text-xs tracking-widest uppercase disabled:opacity-40 self-start"
                style={{ borderColor: "#c8a06a", color: "#c8a06a", letterSpacing: "0.2em" }}>
                {creating ? "..." : "Creer"}
              </button>
            </div>
          )}

          {/* Settings */}
          {selection.kind === "settings" && (
            <div className="flex flex-col gap-10 max-w-lg">
              <h2 className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.2em" }}>
                Listes de reference
              </h2>
              <div className="flex flex-col gap-4">
                <span className="text-xs tracking-widest uppercase pb-2 border-b" style={{ color: "#8a837a", letterSpacing: "0.15em", borderColor: "#2d2926" }}>
                  Regimes politiques
                </span>
                <div className="flex flex-col gap-2">
                  {politicalSystems.map((ps) => (
                    <div key={ps.id} className="flex items-center justify-between py-1">
                      <span className="text-sm" style={{ color: "#dfd8cc" }}>{ps.name}</span>
                      {!ps.isDefault && (
                        <button onClick={async () => {
                          await fetch("/api/political-systems", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: ps.id }) });
                          setPoliticalSystems((p) => p.filter((x) => x.id !== ps.id));
                        }} className="text-xs transition-colors duration-150" style={{ color: "#8a837a" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#a05050")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>
                          Supprimer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Nouveau regime" value={newPSName}
                    onChange={(e) => setNewPSName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPS()}
                    className={inputClass + " flex-1"}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")} />
                  <button onClick={addPS} disabled={savingPS || !newPSName.trim()}
                    className="px-4 py-2 border text-xs tracking-widest uppercase disabled:opacity-40"
                    style={{ borderColor: "#c8a06a", color: "#c8a06a", letterSpacing: "0.15em" }}>
                    {savingPS ? "..." : "Ajouter"}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <span className="text-xs tracking-widest uppercase pb-2 border-b" style={{ color: "#8a837a", letterSpacing: "0.15em", borderColor: "#2d2926" }}>
                  Types de territoire
                </span>
                <div className="flex flex-col gap-2">
                  {territoryTypes.map((tt) => (
                    <div key={tt.id} className="flex items-center justify-between py-1">
                      <span className="text-sm" style={{ color: "#dfd8cc" }}>{tt.name}</span>
                      {!tt.isDefault && (
                        <button onClick={async () => {
                          await fetch("/api/territory-types", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: tt.id }) });
                          setTerritoryTypes((p) => p.filter((x) => x.id !== tt.id));
                        }} className="text-xs transition-colors duration-150" style={{ color: "#8a837a" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#a05050")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>
                          Supprimer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Nouveau type" value={newTTName}
                    onChange={(e) => setNewTTName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTT()}
                    className={inputClass + " flex-1"}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")} />
                  <button onClick={addTT} disabled={savingTT || !newTTName.trim()}
                    className="px-4 py-2 border text-xs tracking-widest uppercase disabled:opacity-40"
                    style={{ borderColor: "#c8a06a", color: "#c8a06a", letterSpacing: "0.15em" }}>
                    {savingTT ? "..." : "Ajouter"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Detail view */}
          {(selection.kind === "nation" || selection.kind === "territory") && (
            loadingDetail ? (
              <p className="text-xs" style={{ color: "#8a837a" }}>Chargement...</p>
            ) : detail ? (
              <div className="max-w-2xl">
                {selection.kind === "nation" ? (
                  <EntityDetail
                    type="nation"
                    entity={detail as NationDetail}
                    isAdmin={isAdmin}
                    politicalSystems={politicalSystems}
                    identities={identities}
                    nations={nations}
                    territories={territories}
                    onUpdate={(data) => {
                      setDetail((p) => p ? { ...p, ...data } : p);
                      if (data.name) setNations((p) => p.map((n) => n.id === selection.id ? { ...n, name: data.name! } : n));
                    }}
                    onDelete={() => handleNationDelete(selection.id)}
                  />
                ) : (
                  <EntityDetail
                    type="territory"
                    entity={detail as TerritoryDetail}
                    isAdmin={isAdmin}
                    politicalSystems={politicalSystems}
                    identities={identities}
                    nations={nations}
                    territories={territories}
                    onUpdate={(data) => {
                      setDetail((p) => p ? { ...p, ...data } : p);
                      if (data.name) setTerritories((p) => p.map((t) => t.id === selection.id ? { ...t, name: data.name! } : t));
                    }}
                    onDelete={() => handleTerritoryDelete(selection.id)}
                    onIndependence={() => handleIndependence(selection.id)}
                  />
                )}
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
