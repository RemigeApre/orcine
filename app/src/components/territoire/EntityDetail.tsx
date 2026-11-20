"use client";

import { useState } from "react";
import SubSection from "./SubSection";
import SynonymList from "./SynonymList";
import PeriodList from "./PeriodList";
import ImageUpload from "./ImageUpload";
import RulerList from "./RulerList";
import RegimeList from "./RegimeList";
import CapitalList from "./CapitalList";
import NationPeriodList from "./NationPeriodList";
import type {
  NationDetail, TerritoryDetail, PoliticalSystem,
  TerritoryRef, IdentityRef, NationRef, Image,
} from "./types";

type Entity = NationDetail | TerritoryDetail;

interface BaseProps {
  isAdmin: boolean;
  politicalSystems: PoliticalSystem[];
  identities: IdentityRef[];
  nations: NationRef[];
  territories: TerritoryRef[];
  onUpdate: (data: Partial<Entity>) => void;
  onDelete: () => void;
  onIndependence?: () => void;
}

interface NationProps extends BaseProps { type: "nation"; entity: NationDetail; }
interface TerritoryProps extends BaseProps { type: "territory"; entity: TerritoryDetail; }
type Props = NationProps | TerritoryProps;

function isNation(props: Props): props is NationProps {
  return props.type === "nation";
}

export default function EntityDetail(props: Props) {
  const { entity, isAdmin, politicalSystems, identities, nations, territories, onUpdate, onDelete } = props;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(entity.name);
  const [description, setDescription] = useState(entity.description ?? "");
  const [notes, setNotes] = useState(entity.notes ?? "");
  const [saving, setSaving] = useState(false);

  const [synonyms, setSynonyms] = useState(entity.synonyms);
  const [periods, setPeriods] = useState(entity.periods);
  const [images, setImages] = useState<Image[]>(entity.images);
  const [rulers, setRulers] = useState(entity.rulers);
  const [regimes, setRegimes] = useState(entity.regimes);
  const [capitals, setCapitals] = useState(isNation(props) ? props.entity.capitals : []);
  const [nationPeriods, setNationPeriods] = useState(!isNation(props) ? (props.entity as TerritoryDetail).nationPeriods : []);

  const apiBase = isNation(props) ? `/api/nations/${entity.id}` : `/api/territories/${entity.id}`;
  const territoryEntity = !isNation(props) ? (entity as TerritoryDetail) : null;

  // ── Infobox derived facts ──────────────────────────────────────────────────
  const currentFlag = images.find((i) => i.isCurrent && i.type === "FLAG");
  const currentCoA = images.find((i) => i.isCurrent && i.type === "COAT_OF_ARMS");
  const sortedRegimes = [...regimes].sort((a, b) => (b.startValue ?? 0) - (a.startValue ?? 0));
  const sortedRulers = [...rulers].sort((a, b) => (b.startValue ?? 0) - (a.startValue ?? 0));
  const currentRegime = sortedRegimes.find((r) => !r.endValue && !r.endLabel) ?? sortedRegimes[0];
  const currentRuler = sortedRulers.find((r) => !r.endValue && !r.endLabel) ?? sortedRulers[0];
  const sortedCapitals = [...capitals].sort((a, b) => (b.startValue ?? 0) - (a.startValue ?? 0));
  const currentCapital = sortedCapitals.find((c) => !c.endValue && !c.endLabel) ?? sortedCapitals[0];
  const sortedNationPeriods = [...nationPeriods].sort((a, b) => (b.startValue ?? 0) - (a.startValue ?? 0));
  const currentNation = sortedNationPeriods.find((p) => !p.endValue && !p.endLabel) ?? sortedNationPeriods[0];

  const infoboxRows: { label: string; value: React.ReactNode }[] = [];
  if (currentRegime) infoboxRows.push({ label: "Régime", value: currentRegime.politicalSystem.name });
  if (currentRuler) infoboxRows.push({
    label: "Dirigeant",
    value: (
      <>
        {currentRuler.title && <span style={{ color: "#8a837a" }}>{currentRuler.title} </span>}
        {currentRuler.identity.name}
      </>
    ),
  });
  if (currentCapital) infoboxRows.push({ label: "Capitale", value: currentCapital.territory.name });
  if (currentNation) infoboxRows.push({ label: "Nation", value: currentNation.nation?.name ?? "Indépendant" });

  const hasInfobox = !!(currentFlag || currentCoA || infoboxRows.length > 0);

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    const res = await fetch(apiBase, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, notes }),
    });
    if (res.ok) {
      onUpdate({ name, description, notes });
      setEditing(false);
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm(`Supprimer "${entity.name}" ? Cette action est irreversible.`)) return;
    await fetch(apiBase, { method: "DELETE" });
    onDelete();
  }

  async function handleIndependence() {
    if (!props.onIndependence) return;
    if (!confirm(`Creer une nation independante a partir de "${entity.name}" ?`)) return;
    const res = await fetch(`${apiBase}/independence`, { method: "POST" });
    if (res.ok) props.onIndependence();
  }

  const inputClass = "border px-3 py-2 text-sm outline-none transition-colors duration-150 bg-transparent w-full";
  const inputStyle = { borderColor: "#2d2926", color: "#dfd8cc" };

  return (
    <div className="flex gap-10 items-start">

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Title + admin actions */}
        <div className="flex items-start justify-between gap-4 mb-1">
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              style={{ ...inputStyle, fontFamily: "var(--font-cormorant)", fontSize: "1.8rem" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
            />
          ) : (
            <div>
              <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "2.4rem", color: "#dfd8cc", lineHeight: 1.1, fontWeight: 600 }}>
                {entity.name}
              </h1>
              {territoryEntity?.type && (
                <span className="text-xs tracking-widest uppercase mt-1 inline-block" style={{ color: "#8a837a", letterSpacing: "0.15em" }}>
                  {territoryEntity.type.name}
                </span>
              )}
              {synonyms.length > 0 && !editing && (
                <p className="text-xs mt-1" style={{ color: "#8a837a", fontStyle: "italic" }}>
                  Aussi connu sous : {synonyms.map((s) => s.name).join(", ")}
                </p>
              )}
              {territoryEntity?.becameNation && (
                <p className="text-xs mt-1" style={{ color: "#c8a06a" }}>
                  Nation : {territoryEntity.becameNation.name}
                </p>
              )}
            </div>
          )}

          {isAdmin && (
            <div className="flex gap-4 shrink-0 pt-2">
              {editing ? (
                <>
                  <button onClick={handleSave} disabled={saving}
                    className="text-xs tracking-widest uppercase disabled:opacity-40"
                    style={{ color: "#c8a06a", letterSpacing: "0.15em" }}>
                    {saving ? "..." : "Enregistrer"}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="text-xs tracking-widest uppercase"
                    style={{ color: "#8a837a", letterSpacing: "0.15em" }}>
                    Annuler
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing(true)}
                    className="text-xs tracking-widest uppercase"
                    style={{ color: "#c8a06a", letterSpacing: "0.15em" }}>
                    Modifier
                  </button>
                  {!isNation(props) && !territoryEntity?.becameNation && (
                    <button onClick={handleIndependence}
                      className="text-xs tracking-widest uppercase"
                      style={{ color: "#8a837a", letterSpacing: "0.15em" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#c8a06a")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>
                      Independance
                    </button>
                  )}
                  <button onClick={handleDelete}
                    className="text-xs tracking-widest uppercase"
                    style={{ color: "#8a837a", letterSpacing: "0.15em" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#a05050")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>
                    Supprimer
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Title divider */}
        <div className="border-b mb-5 mt-3" style={{ borderColor: "#2d2926" }} />

        {/* Description / Notes */}
        {editing ? (
          <div className="flex flex-col gap-3 mb-6">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Description"
              className={inputClass}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Notes (internes)"
              className={inputClass}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
            />
          </div>
        ) : (
          <div className="mb-2">
            {entity.description && (
              <p className="text-sm mb-5" style={{ color: "#c8c2b8", lineHeight: 1.9, whiteSpace: "pre-wrap", maxWidth: "72ch" }}>
                {entity.description}
              </p>
            )}
            {entity.notes && (
              <div className="border-l-2 pl-4 mb-5" style={{ borderColor: "#2d2926" }}>
                <p className="text-xs" style={{ color: "#8a837a", lineHeight: 1.75, whiteSpace: "pre-wrap", fontStyle: "italic" }}>
                  {entity.notes}
                </p>
              </div>
            )}
            {!entity.description && !entity.notes && isAdmin && (
              <p className="text-xs italic mb-4" style={{ color: "#3a3632" }}>
                Aucune description — cliquer Modifier pour en ajouter une.
              </p>
            )}
          </div>
        )}

        {/* Sub-sections */}
        <SubSection title="Synonymes" count={synonyms.length} defaultOpen={false}>
          <SynonymList synonyms={synonyms} apiBase={`${apiBase}/synonyms`} isAdmin={isAdmin}
            onAdd={(s) => setSynonyms((p) => [...p, s])}
            onDelete={(id) => setSynonyms((p) => p.filter((s) => s.id !== id))} />
        </SubSection>

        <SubSection title="Images" count={images.length}>
          <ImageUpload images={images} apiBase={`${apiBase}/images`} isAdmin={isAdmin}
            onAdd={(img) => setImages((p) => [...p, img])}
            onDelete={async (id) => {
              await fetch(`${apiBase}/images`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
              setImages((p) => p.filter((i) => i.id !== id));
            }} />
        </SubSection>

        <SubSection title="Périodes d'existence" count={periods.length}>
          <PeriodList periods={periods} apiBase={`${apiBase}/periods`} isAdmin={isAdmin}
            onAdd={(p) => setPeriods((prev) => [...prev, p])}
            onDelete={(id) => setPeriods((p) => p.filter((x) => x.id !== id))}
            onUpdate={(p) => setPeriods((prev) => prev.map((x) => x.id === p.id ? p : x))} />
        </SubSection>

        <SubSection title="Dirigeants" count={rulers.length}>
          <RulerList rulers={rulers} apiBase={`${apiBase}/rulers`} isAdmin={isAdmin} identities={identities}
            onAdd={(r) => setRulers((p) => [...p, r])}
            onDelete={(id) => setRulers((p) => p.filter((r) => r.id !== id))}
            onUpdate={(r) => setRulers((p) => p.map((x) => x.id === r.id ? r : x))} />
        </SubSection>

        <SubSection title="Régimes politiques" count={regimes.length}>
          <RegimeList regimes={regimes} apiBase={`${apiBase}/regimes`} isAdmin={isAdmin} politicalSystems={politicalSystems}
            onAdd={(r) => setRegimes((p) => [...p, r])}
            onDelete={(id) => setRegimes((p) => p.filter((r) => r.id !== id))}
            onUpdate={(r) => setRegimes((p) => p.map((x) => x.id === r.id ? r : x))} />
        </SubSection>

        {isNation(props) && (
          <SubSection title="Capitales" count={capitals.length}>
            <CapitalList capitals={capitals} apiBase={`${apiBase}/capitals`} isAdmin={isAdmin} territories={territories}
              onAdd={(c) => setCapitals((p) => [...p, c])}
              onDelete={(id) => setCapitals((p) => p.filter((c) => c.id !== id))}
              onUpdate={(c) => setCapitals((p) => p.map((x) => x.id === c.id ? c : x))} />
          </SubSection>
        )}

        {!isNation(props) && (
          <SubSection title="Appartenance nationale" count={nationPeriods.length}>
            <NationPeriodList nationPeriods={nationPeriods} apiBase={`${apiBase}/nation-periods`} isAdmin={isAdmin} nations={nations}
              onAdd={(p) => setNationPeriods((prev) => [...prev, p])}
              onDelete={(id) => setNationPeriods((p) => p.filter((x) => x.id !== id))}
              onUpdate={(p) => setNationPeriods((prev) => prev.map((x) => x.id === p.id ? p : x))} />
          </SubSection>
        )}
      </div>

      {/* ── Infobox ──────────────────────────────────────────────────────── */}
      {hasInfobox && !editing && (
        <div className="shrink-0 sticky" style={{ top: "16px", width: "210px" }}>
          <div className="border overflow-hidden" style={{ borderColor: "#2d2926" }}>

            {/* Infobox header */}
            <div className="px-3 py-2 text-center border-b" style={{ borderColor: "#2d2926", backgroundColor: "#1c1a18" }}>
              <span className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.15em" }}>
                {isNation(props) ? "Nation" : (territoryEntity?.type?.name ?? "Territoire")}
              </span>
            </div>

            {/* Flag */}
            {currentFlag && (
              <div className="p-4 flex items-center justify-center border-b" style={{ borderColor: "#2d2926", backgroundColor: "#171614" }}>
                <img
                  src={`/api/files/${currentFlag.filePath}`}
                  alt="Drapeau"
                  className="w-full object-contain"
                  style={{ maxHeight: "110px" }}
                />
              </div>
            )}

            {/* Coat of arms */}
            {currentCoA && (
              <div className="p-3 flex items-center justify-center border-b" style={{ borderColor: "#2d2926", backgroundColor: "#171614" }}>
                <img
                  src={`/api/files/${currentCoA.filePath}`}
                  alt="Blason"
                  className="object-contain"
                  style={{ maxHeight: "72px" }}
                />
              </div>
            )}

            {/* Key facts */}
            {infoboxRows.length > 0 && (
              <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                <tbody>
                  {infoboxRows.map((row, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: "#1e1c1a" }}>
                      <td className="px-3 py-2" style={{ color: "#8a837a", width: "42%", verticalAlign: "top", fontWeight: 500 }}>
                        {row.label}
                      </td>
                      <td className="px-3 py-2" style={{ color: "#dfd8cc" }}>
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
