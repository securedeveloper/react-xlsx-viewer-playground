// Label presets for the `labels` prop. The playground uses the string-valued labels
// only, so the generated code is plain data; the function-valued ones (counts, sheet
// names) keep their English defaults unless the app passes its own functions.

import { DEFAULT_LABELS, type ViewerLabels } from 'react-xlsx-viewer';

export type StringLabels = Partial<Record<StringLabelKey, string>>;
export type StringLabelKey = {
  [K in keyof ViewerLabels]: ViewerLabels[K] extends string ? K : never;
}[keyof ViewerLabels];

export const STRING_LABEL_KEYS: readonly StringLabelKey[] = (Object.keys(DEFAULT_LABELS) as Array<keyof ViewerLabels>).filter(
  (k): k is StringLabelKey => typeof DEFAULT_LABELS[k] === 'string',
);

export interface LabelPreset {
  id: string;
  name: string;
  labels: StringLabels;
}

export const LABEL_PRESETS: readonly LabelPreset[] = [
  { id: 'en', name: 'English (default)', labels: {} },
  {
    id: 'de',
    name: 'Deutsch',
    labels: {
      viewer: 'Arbeitsmappen-Ansicht',
      cellAddress: 'Zelladresse',
      formula: 'Formel',
      value: 'Wert',
      notCalculated: 'nicht berechnet',
      noWorkbook: 'Keine Arbeitsmappe geöffnet.',
      cancel: 'Abbrechen',
      details: 'Details',
      sheets: 'Blätter',
      allSheets: 'Alle Blätter',
      selectAll: 'Alle Zellen auswählen',
      hiddenSheet: '(ausgeblendet)',
      scrollTabsBack: 'Vorherige Blätter',
      scrollTabsForward: 'Nächste Blätter',
      zoom: 'Zoom',
      zoomIn: 'Vergrößern',
      zoomOut: 'Verkleinern',
      fitWidth: 'An Breite anpassen',
      shortcuts: 'Tastenkombinationen',
      close: 'Schließen',
      dismiss: 'Ausblenden',
      linkOpen: 'Öffnen',
      notShownTitle: 'Einige Inhalte werden nicht angezeigt',
      filterButton: 'Filter (in dieser Ansicht nicht verfügbar)',
    },
  },
  {
    id: 'fr',
    name: 'Français',
    labels: {
      viewer: 'Visionneuse de classeur',
      cellAddress: 'Adresse de la cellule',
      formula: 'Formule',
      value: 'Valeur',
      notCalculated: 'non calculé',
      noWorkbook: 'Aucun classeur ouvert.',
      cancel: 'Annuler',
      details: 'Détails',
      sheets: 'Feuilles',
      allSheets: 'Toutes les feuilles',
      selectAll: 'Sélectionner toutes les cellules',
      hiddenSheet: '(masquée)',
      scrollTabsBack: 'Feuilles précédentes',
      scrollTabsForward: 'Feuilles suivantes',
      zoom: 'Zoom',
      zoomIn: 'Zoom avant',
      zoomOut: 'Zoom arrière',
      fitWidth: 'Ajuster à la largeur',
      shortcuts: 'Raccourcis clavier',
      close: 'Fermer',
      dismiss: 'Ignorer',
      linkOpen: 'Ouvrir',
      notShownTitle: 'Certains contenus ne sont pas affichés',
      filterButton: 'Filtre (non disponible dans cette visionneuse)',
    },
  },
];

export const LABEL_PRESET_IDS: readonly string[] = [...LABEL_PRESETS.map((p) => p.id), 'custom'];

export interface ParsedLabels {
  labels: StringLabels;
  error: string | null;
}

/** Parses user-edited label JSON: an object of known string labels. Unknown keys are reported. */
export function parseCustomLabels(json: string): ParsedLabels {
  if (!json.trim()) return { labels: {}, error: null };
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch (e) {
    return { labels: {}, error: `Invalid JSON: ${(e as Error).message}` };
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return { labels: {}, error: 'Expected a JSON object.' };
  const labels: StringLabels = {};
  const unknown: string[] = [];
  for (const [k, v] of Object.entries(data)) {
    if ((STRING_LABEL_KEYS as readonly string[]).includes(k) && typeof v === 'string') labels[k as StringLabelKey] = v;
    else unknown.push(k);
  }
  return { labels, error: unknown.length ? `Ignored (not a string label): ${unknown.join(', ')}` : null };
}

export function resolveLabels(preset: string, customJson: string): ParsedLabels {
  if (preset === 'custom') return parseCustomLabels(customJson);
  return { labels: LABEL_PRESETS.find((p) => p.id === preset)?.labels ?? {}, error: null };
}
