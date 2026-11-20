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
  TerritoryRef, IdentityRef, NationRef, Image, Synonym,
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

  const territoryEntity = !isNation(props) ? (entity as TerritoryDetail) : null;

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        {editing ? (
          <input value={name} onChange={(e) => setName(e.target.value)}
            className={inputClass + " text-2xl"}
            style={{ ...inputStyle, fontFamily: "var(--font-cormorant)", fontSize: "1.6rem" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")} />
        ) : (
          <div className="flex flex-col gap-1">
            <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.8rem", color: "#dfd8cc", lineHeight: 1.2 }}>
              {entity.name}
            </h2>
            {territoryEntity?.type && (
              <span className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.15em" }}>
                {territoryEntity.type.name}
              </span>
            )}
            {territoryEntity?.becameNation && (
              <span className="text-xs" style={{ color: "#c8a06a" }}>
                Nation : {territoryEntity.becameNation.name}
              </span>
            )}
          </div>
        )}
        {isAdmin && (
          <div className="flex gap-4 shrink-0 pt-1">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving}
                  className="text-xs tracking-widest uppercase disabled:opacity-40"
                  style={{ color: "#c8a06a", letterSpacing: "0.15em" }}>
                  {saving ? "..." : "Enregistrer"}
                </button>
                <button onClick={() => setEditing(false)}
                  className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.15em" }}>
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)}
                  className="text-xs tracking-widest uppercase transition-colors duration-150"
                  style={{ color: "#c8a06a", letterSpacing: "0.15em" }}>
                  Modifier
                </button>
                {!isNation(props) && !territoryEntity?.becameNation && (
                  <button onClick={handleIndependence}
                    className="text-xs tracking-widest uppercase transition-colors duration-150"
                    style={{ color: "#8a837a", letterSpacing: "0.15em" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#c8a06a")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}>
                    Independance
                  </button>
                )}
                <button onClick={handleDelete}
                  className="text-xs tracking-widest uppercase transition-colors duration-150"
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

      {/* Description / Notes */}
      {editing ? (
        <div className="flex flex-col gap-3 mb-6">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            rows={4} placeholder="Description"
            className={inputClass} style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")} />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            rows={3} placeholder="Notes"
            className={inputClass} style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")} />
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {entity.description && (
            <p className="text-sm leading-relaxed" style={{ color: "#dfd8cc", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
              {entity.description}
            </p>
          )}
          {entity.notes && (
            <p className="text-xs leading-relaxed" style={{ color: "#8a837a", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {entity.notes}
            </p>
          )}
          {!entity.description && !entity.notes && (
            <p className="text-xs italic" style={{ color: "#8a837a" }}>Aucune description</p>
          )}
        </div>
      )}

      {/* Sub-sections */}
      <SubSection title="Synonymes" count={synonyms.length}>
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

      <SubSection title="Periodes d'existence" count={periods.length}>
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

      <SubSection title="Regimes politiques" count={regimes.length}>
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
  );
}
