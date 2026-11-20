"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import TerritoireHeader from "./TerritoireHeader";
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

type NavItem = { kind: "nation" | "territory"; id: string; name: string };
type SidebarItem = { id: string; name: string; typeName?: string; hasChildren: boolean };

export default function TerritoireClient({
  initialNations, initialTerritories, politicalSystems: initPS,
  territoryTypes: initTT, identities, isAdmin,
}: Props) {
  const router = useRouter();
  const [nations, setNations] = useState<NationRef[]>(initialNations);
  const [allTerritories, setAllTerritories] = useState<TerritoryRef[]>(initialTerritories);
  const [politicalSystems, setPoliticalSystems] = useState<PoliticalSystem[]>(initPS);
  const [territoryTypes, setTerritoryTypes] = useState<TerritoryType[]>(initTT);

  const [navStack, setNavStack] = useState<NavItem[]>([]);
  const [detail, setDetail] = useState<NationDetail | TerritoryDetail | null>(null);
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [showNewNation, setShowNewNation] = useState(false);
  const [newNationName, setNewNationName] = useState("");
  const [showNewTerritory, setShowNewTerritory] = useState(false);
  const [newTerritoryName, setNewTerritoryName] = useState("");
  const [newTerritoryTypeId, setNewTerritoryTypeId] = useState("");
  const [creating, setCreating] = useState(false);

  const current = navStack[navStack.length - 1] ?? null;
  const isCards = navStack.length === 0;

  // ─── Navigation ───────────────────────────────────────────────────────────

  async function openNation(id: string, name: string) {
    setLoadingDetail(true);
    setShowNewTerritory(false);
    const [detailRes, terrRes] = await Promise.all([
      fetch(`/api/nations/${id}`),
      fetch(`/api/nations/${id}/territories`),
    ]);
    if (detailRes.ok) setDetail(await detailRes.json());
    if (terrRes.ok) {
      const items = await terrRes.json();
      setSidebarItems(items.map((t: { id: string; name: string; type?: { name: string } | null; _count?: { children: number } }) => ({
        id: t.id,
        name: t.name,
        typeName: t.type?.name,
        hasChildren: (t._count?.children ?? 0) > 0,
      })));
    }
    setNavStack([{ kind: "nation", id, name }]);
    setLoadingDetail(false);
  }

  async function openTerritory(id: string, name: string) {
    setLoadingDetail(true);
    setShowNewTerritory(false);
    const res = await fetch(`/api/territories/${id}`);
    if (res.ok) {
      const data: TerritoryDetail = await res.json();
      setDetail(data);
      setSidebarItems((data.children ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        typeName: c.type?.name,
        hasChildren: false,
      })));
    }
    setNavStack((prev) => {
      const idx = prev.findIndex((x) => x.id === id);
      if (idx !== -1) return prev.slice(0, idx + 1);
      return [...prev, { kind: "territory", id, name }];
    });
    setLoadingDetail(false);
  }

  function goBack() {
    if (navStack.length === 0) {
      router.push("/dashboard");
      return;
    }
    if (navStack.length === 1) {
      setNavStack([]);
      setDetail(null);
      setSidebarItems([]);
      return;
    }
    const prev = navStack[navStack.length - 2];
    setNavStack((s) => s.slice(0, -1));
    if (prev.kind === "nation") openNation(prev.id, prev.name);
    else openTerritory(prev.id, prev.name);
  }

  const backLabel = isCards
    ? "Territoire"
    : navStack.length === 1
    ? "Territoire"
    : navStack[navStack.length - 2].name;

  // ─── Create nation ─────────────────────────────────────────────────────────

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
      setNations((p) => [...p, { id: nation.id, name: nation.name, flagPath: null }]
        .sort((a, b) => a.name.localeCompare(b.name)));
      setNewNationName("");
      setShowNewNation(false);
      await openNation(nation.id, nation.name);
    }
    setCreating(false);
  }

  // ─── Create territory ──────────────────────────────────────────────────────

  async function createTerritory() {
    if (!newTerritoryName.trim() || !current) return;
    setCreating(true);

    const parentId = current.kind === "territory" ? current.id : null;
    const level = navStack.length;

    const res = await fetch("/api/territories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTerritoryName.trim(),
        typeId: newTerritoryTypeId || null,
        level,
        parentId,
      }),
    });

    if (res.ok) {
      const t = await res.json();

      if (current.kind === "nation") {
        await fetch(`/api/territories/${t.id}/nation-periods`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nationId: current.id, relationType: "DIRECT" }),
        });
      }

      const type = territoryTypes.find((x) => x.id === newTerritoryTypeId) ?? null;
      setAllTerritories((p) => [...p, { id: t.id, name: t.name, level, parentId, type }]
        .sort((a, b) => a.name.localeCompare(b.name)));
      setSidebarItems((p) => [...p, { id: t.id, name: t.name, typeName: type?.name, hasChildren: false }]
        .sort((a, b) => a.name.localeCompare(b.name)));

      setNewTerritoryName("");
      setNewTerritoryTypeId("");
      setShowNewTerritory(false);
      await openTerritory(t.id, t.name);
    }
    setCreating(false);
  }

  // ─── Callbacks ─────────────────────────────────────────────────────────────

  const handleNationDelete = useCallback(() => {
    if (!current) return;
    setNations((p) => p.filter((n) => n.id !== current.id));
    setNavStack([]);
    setDetail(null);
    setSidebarItems([]);
  }, [current]);

  const handleTerritoryDelete = useCallback(() => {
    if (!current) return;
    setAllTerritories((p) => p.filter((t) => t.id !== current.id));
    setSidebarItems((p) => p.filter((i) => i.id !== current.id));
    goBack();
  }, [current]);

  const handleIndependence = useCallback(async () => {
    const res = await fetch("/api/nations");
    if (res.ok) {
      const updated = await res.json();
      setNations(updated.map((n: { id: string; name: string }) => ({ ...n, flagPath: null })));
    }
    if (current) await openTerritory(current.id, current.name);
  }, [current]);

  // ─── Render ────────────────────────────────────────────────────────────────

  const inputClass = "border px-3 py-2 text-sm outline-none transition-colors duration-150 bg-transparent";
  const inputStyle = { borderColor: "#2d2926", color: "#dfd8cc" };

  return (
    <div className="min-h-screen flex flex-col">
      <TerritoireHeader backLabel={backLabel} onBack={goBack} isAdmin={isAdmin} />

      {/* ─── Cards view ─── */}
      {isCards && (
        <div className="pt-20 px-10 py-10">
          <div className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>

            {/* Add card (admin) */}
            {isAdmin && (
              <button
                onClick={() => setShowNewNation((p) => !p)}
                className="flex flex-col items-center justify-center border-2 border-dashed transition-colors duration-200"
                style={{
                  borderColor: showNewNation ? "#c8a06a" : "#2d2926",
                  minHeight: "220px",
                  color: "#8a837a",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = showNewNation ? "#c8a06a" : "#2d2926")}
              >
                <span style={{ fontSize: "2rem", color: "#c8a06a" }}>+</span>
                <span className="mt-2 text-xs tracking-widest uppercase" style={{ letterSpacing: "0.15em" }}>
                  Ajouter
                </span>
              </button>
            )}

            {/* Nation cards */}
            {nations.map((n) => (
              <button
                key={n.id}
                onClick={() => openNation(n.id, n.name)}
                className="flex flex-col border transition-colors duration-200 text-left overflow-hidden"
                style={{ borderColor: "#2d2926", minHeight: "220px" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
              >
                <div className="flex-1 flex items-center justify-center p-4"
                  style={{ backgroundColor: "#1c1a18" }}>
                  {n.flagPath ? (
                    <img src={`/api/files/${n.flagPath}`} alt={n.name}
                      className="w-full object-contain" style={{ maxHeight: "120px" }} />
                  ) : (
                    <span style={{ color: "#2d2926", fontSize: "2.5rem" }}>&#9873;</span>
                  )}
                </div>
                <div className="px-4 py-3 border-t" style={{ borderColor: "#2d2926" }}>
                  <span style={{ color: "#dfd8cc", fontFamily: "var(--font-cormorant)", fontSize: "1.1rem" }}>
                    {n.name}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* New nation inline form */}
          {showNewNation && isAdmin && (
            <div className="flex gap-3 mt-8 max-w-sm">
              <input
                type="text"
                placeholder="Nom de la nation *"
                value={newNationName}
                onChange={(e) => setNewNationName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createNation()}
                autoFocus
                className={inputClass + " flex-1"}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
              />
              <button onClick={createNation} disabled={creating || !newNationName.trim()}
                className="px-5 py-2 border text-xs tracking-widest uppercase disabled:opacity-40"
                style={{ borderColor: "#c8a06a", color: "#c8a06a", letterSpacing: "0.15em" }}>
                {creating ? "..." : "Creer"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Detail view (nation or territory) ─── */}
      {!isCards && (
        <div className="pt-20 flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 73px)" }}>

          {/* Sidebar */}
          <div className="flex flex-col border-r overflow-y-auto shrink-0"
            style={{ width: "260px", borderColor: "#2d2926" }}>

            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "#2d2926" }}>
              <span className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.15em" }}>
                {sidebarItems.length} subdivision{sidebarItems.length !== 1 ? "s" : ""}
              </span>
              {isAdmin && (
                <button onClick={() => setShowNewTerritory((p) => !p)}
                  className="text-xs" style={{ color: "#c8a06a" }}>
                  + Ajouter
                </button>
              )}
            </div>

            {showNewTerritory && isAdmin && (
              <div className="flex flex-col gap-2 px-4 py-3 border-b" style={{ borderColor: "#2d2926" }}>
                <input type="text" placeholder="Nom *" value={newTerritoryName}
                  onChange={(e) => setNewTerritoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createTerritory()}
                  autoFocus
                  className={inputClass + " w-full text-xs"}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")} />
                <select value={newTerritoryTypeId} onChange={(e) => setNewTerritoryTypeId(e.target.value)}
                  className={inputClass + " w-full text-xs"}
                  style={{ ...inputStyle, color: newTerritoryTypeId ? "#dfd8cc" : "#8a837a" }}>
                  <option value="" style={{ backgroundColor: "#1c1a18" }}>Type (optionnel)</option>
                  {territoryTypes.map((t) => (
                    <option key={t.id} value={t.id} style={{ backgroundColor: "#1c1a18" }}>{t.name}</option>
                  ))}
                </select>
                <button onClick={createTerritory} disabled={creating || !newTerritoryName.trim()}
                  className="border text-xs tracking-widest uppercase py-1.5 disabled:opacity-40"
                  style={{ borderColor: "#c8a06a", color: "#c8a06a", letterSpacing: "0.15em" }}>
                  {creating ? "..." : "Creer"}
                </button>
              </div>
            )}

            {sidebarItems.length === 0 && (
              <p className="px-5 py-6 text-xs italic" style={{ color: "#8a837a" }}>Aucune subdivision</p>
            )}

            {sidebarItems.map((item) => {
              const isCurrent = current?.id === item.id;
              return (
                <button key={item.id} onClick={() => openTerritory(item.id, item.name)}
                  className="text-left px-5 py-3 border-b transition-colors duration-150 flex flex-col gap-0.5"
                  style={{
                    borderColor: "#1e1c1a",
                    backgroundColor: isCurrent ? "#1c1a18" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.backgroundColor = "#171614"; }}
                  onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.backgroundColor = "transparent"; }}>
                  <span style={{ color: "#dfd8cc", fontFamily: "var(--font-cormorant)", fontSize: "1.05rem" }}>
                    {item.name}
                  </span>
                  {item.typeName && (
                    <span className="text-xs" style={{ color: "#8a837a" }}>{item.typeName}</span>
                  )}
                  {item.hasChildren && (
                    <span className="text-xs" style={{ color: "#8a837a" }}>&#8594;</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto px-10 py-8">
            {loadingDetail ? (
              <p className="text-xs" style={{ color: "#8a837a" }}>Chargement...</p>
            ) : detail && current ? (
              current.kind === "nation" ? (
                <EntityDetail
                  type="nation"
                  entity={detail as NationDetail}
                  isAdmin={isAdmin}
                  politicalSystems={politicalSystems}
                  identities={identities}
                  nations={nations}
                  territories={allTerritories}
                  onUpdate={(data) => {
                    setDetail((p) => p ? { ...p, ...data } : p);
                    if (data.name) {
                      setNations((p) => p.map((n) => n.id === current.id ? { ...n, name: data.name! } : n));
                      setNavStack((p) => p.map((x) => x.id === current.id ? { ...x, name: data.name! } : x));
                    }
                  }}
                  onDelete={handleNationDelete}
                />
              ) : (
                <EntityDetail
                  type="territory"
                  entity={detail as TerritoryDetail}
                  isAdmin={isAdmin}
                  politicalSystems={politicalSystems}
                  identities={identities}
                  nations={nations}
                  territories={allTerritories}
                  onUpdate={(data) => {
                    setDetail((p) => p ? { ...p, ...data } : p);
                    if (data.name) {
                      setAllTerritories((p) => p.map((t) => t.id === current.id ? { ...t, name: data.name! } : t));
                      setNavStack((p) => p.map((x) => x.id === current.id ? { ...x, name: data.name! } : x));
                    }
                  }}
                  onDelete={handleTerritoryDelete}
                  onIndependence={handleIndependence}
                />
              )
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
