export type PoliticalSystem = { id: string; name: string; isDefault?: boolean };
export type TerritoryType = { id: string; name: string; isDefault?: boolean };
export type IdentityRef = { id: string; name: string };
export type NationRef = { id: string; name: string; flagPath?: string | null };
export type TerritoryRef = { id: string; name: string; level: number; parentId: string | null; type: TerritoryType | null };

export type DateRange = {
  startValue?: number | null;
  startLabel?: string | null;
  endValue?: number | null;
  endLabel?: string | null;
};

export type Period = DateRange & {
  id: string;
  endType: string;
  continuity: string;
  notes?: string | null;
};

export type Image = DateRange & {
  id: string;
  type: "FLAG" | "COAT_OF_ARMS";
  isCurrent: boolean;
  filePath: string;
  notes?: string | null;
};

export type Ruler = DateRange & {
  id: string;
  identityId: string;
  identity: IdentityRef;
  title?: string | null;
  notes?: string | null;
};

export type Regime = DateRange & {
  id: string;
  politicalSystemId: string;
  politicalSystem: PoliticalSystem;
  notes?: string | null;
};

export type Synonym = { id: string; name: string };

export type Capital = DateRange & {
  id: string;
  territoryId: string;
  territory: TerritoryRef;
  notes?: string | null;
};

export type NationDetail = {
  id: string;
  name: string;
  description?: string | null;
  notes?: string | null;
  originTerritoryId?: string | null;
  synonyms: Synonym[];
  periods: Period[];
  images: Image[];
  rulers: Ruler[];
  regimes: Regime[];
  capitals: Capital[];
};

export type TerritoryNationPeriod = DateRange & {
  id: string;
  nationId?: string | null;
  nation?: NationRef | null;
  relationType: string;
  notes?: string | null;
};

export type TerritoryDetail = {
  id: string;
  name: string;
  level: number;
  parentId?: string | null;
  typeId?: string | null;
  type?: TerritoryType | null;
  description?: string | null;
  notes?: string | null;
  becameNation?: NationRef | null;
  synonyms: Synonym[];
  periods: Period[];
  images: Image[];
  rulers: Ruler[];
  regimes: Regime[];
  nationPeriods: TerritoryNationPeriod[];
  children: TerritoryRef[];
};
