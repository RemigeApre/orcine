export const nationInclude = {
  synonyms: true,
  periods: true,
  images: true,
  rulers: { include: { identity: { select: { id: true, name: true } } } },
  regimes: { include: { politicalSystem: true } },
  capitals: { include: { territory: { select: { id: true, name: true } } } },
} as const;

export const territoryInclude = {
  type: true,
  synonyms: true,
  periods: true,
  images: true,
  rulers: { include: { identity: { select: { id: true, name: true } } } },
  regimes: { include: { politicalSystem: true } },
  nationPeriods: { include: { nation: { select: { id: true, name: true } } } },
  children: { select: { id: true, name: true, level: true, typeId: true, type: true } },
  becameNation: { select: { id: true, name: true } },
} as const;
