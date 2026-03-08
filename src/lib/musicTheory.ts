// All 12 chromatic notes
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export type NoteName = string;

// Standard tuning E A D G B E (low to high)
export const STANDARD_TUNING = [40, 45, 50, 55, 59, 64]; // MIDI numbers E2-E4

export const TUNING_NOTES = ['E', 'A', 'D', 'G', 'B', 'E'];

// Scale formulas as semitone intervals from root
export const SCALE_FORMULAS: Record<string, number[]> = {
  'Maior': [0, 2, 4, 5, 7, 9, 11],
  'Menor Natural': [0, 2, 3, 5, 7, 8, 10],
  'Menor Harmônica': [0, 2, 3, 5, 7, 8, 11],
  'Menor Melódica': [0, 2, 3, 5, 7, 9, 11],
  'Pentatônica Maior': [0, 2, 4, 7, 9],
  'Pentatônica Menor': [0, 3, 5, 7, 10],
  'Blues': [0, 3, 5, 6, 7, 10],
  // Greek modes
  'Jônio': [0, 2, 4, 5, 7, 9, 11],
  'Dórico': [0, 2, 3, 5, 7, 9, 10],
  'Frígio': [0, 1, 3, 5, 7, 8, 10],
  'Lídio': [0, 2, 4, 6, 7, 9, 11],
  'Mixolídio': [0, 2, 4, 5, 7, 9, 10],
  'Eólio': [0, 2, 3, 5, 7, 8, 10],
  'Lócrio': [0, 1, 3, 5, 6, 8, 10],
};

export const SCALE_CATEGORIES = {
  'Escalas Básicas': ['Maior', 'Menor Natural', 'Menor Harmônica', 'Menor Melódica'],
  'Pentatônicas': ['Pentatônica Maior', 'Pentatônica Menor', 'Blues'],
  'Modos Gregos': ['Jônio', 'Dórico', 'Frígio', 'Lídio', 'Mixolídio', 'Eólio', 'Lócrio'],
};

export const INTERVAL_NAMES: Record<number, string> = {
  0: '1', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4',
  6: 'b5', 7: '5', 8: 'b6', 9: '6', 10: 'b7', 11: '7',
};

export const DEGREE_LABELS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

export const CHORD_QUALITIES = ['Major', 'minor', 'minor', 'Major', 'Major', 'minor', 'diminished'];

// Use flats for these keys
const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb']);

export function useFlats(root: string): boolean {
  return FLAT_KEYS.has(root) || root.includes('b');
}

export function getNoteIndex(note: string): number {
  const idx = NOTES.indexOf(note as any);
  if (idx >= 0) return idx;
  const idxFlat = NOTES_FLAT.indexOf(note as any);
  if (idxFlat >= 0) return idxFlat;
  return 0;
}

export function getNoteName(index: number, flats = false): string {
  const i = ((index % 12) + 12) % 12;
  return flats ? NOTES_FLAT[i] : NOTES[i];
}

export function getScale(root: string, scaleType: string): string[] {
  const formula = SCALE_FORMULAS[scaleType];
  if (!formula) return [];
  const rootIdx = getNoteIndex(root);
  const flats = useFlats(root);
  return formula.map(interval => getNoteName(rootIdx + interval, flats));
}

export function getDegree(note: string, root: string): number {
  const rootIdx = getNoteIndex(root);
  const noteIdx = getNoteIndex(note);
  const interval = ((noteIdx - rootIdx) + 12) % 12;
  // Find which degree this interval corresponds to in major scale
  const majorFormula = SCALE_FORMULAS['Maior'];
  const degreeIdx = majorFormula.indexOf(interval);
  return degreeIdx >= 0 ? degreeIdx + 1 : -1;
}

export function getScaleDegree(note: string, root: string, scaleType: string): number {
  const formula = SCALE_FORMULAS[scaleType];
  if (!formula) return -1;
  const rootIdx = getNoteIndex(root);
  const noteIdx = getNoteIndex(note);
  const interval = ((noteIdx - rootIdx) + 12) % 12;
  const idx = formula.indexOf(interval);
  return idx >= 0 ? idx + 1 : -1;
}

export function getIntervalName(note: string, root: string): string {
  const rootIdx = getNoteIndex(root);
  const noteIdx = getNoteIndex(note);
  const interval = ((noteIdx - rootIdx) + 12) % 12;
  return INTERVAL_NAMES[interval] || '?';
}

export interface ChordInfo {
  name: string;
  root: string;
  quality: string;
  notes: string[];
  degree: number;
  romanNumeral: string;
}

export function getHarmonicField(root: string): ChordInfo[] {
  return getHarmonicFieldForScale(root, 'Maior');
}

export function getHarmonicFieldForScale(root: string, scaleType: string): ChordInfo[] {
  const formula = SCALE_FORMULAS[scaleType];
  if (!formula || formula.length < 7) {
    // For pentatonic/blues (less than 7 notes), fall back to parent scale
    if (scaleType === 'Pentatônica Menor' || scaleType === 'Eólio') return getHarmonicFieldForScale(root, 'Menor Natural');
    if (scaleType === 'Pentatônica Maior' || scaleType === 'Jônio') return getHarmonicFieldForScale(root, 'Maior');
    if (scaleType === 'Blues') return getHarmonicFieldForScale(root, 'Menor Natural');
    if (scaleType === 'Dórico') return getHarmonicFieldForScale(root, 'Menor Natural');
    if (scaleType === 'Frígio') return getHarmonicFieldForScale(root, 'Menor Natural');
    if (scaleType === 'Lídio') return getHarmonicFieldForScale(root, 'Maior');
    if (scaleType === 'Mixolídio') return getHarmonicFieldForScale(root, 'Maior');
    if (scaleType === 'Lócrio') return getHarmonicFieldForScale(root, 'Menor Natural');
    return getHarmonicFieldForScale(root, 'Maior');
  }

  const rootIdx = getNoteIndex(root);
  const flats = useFlats(root);

  return formula.map((interval, i) => {
    const noteIdx = (rootIdx + interval) % 12;
    const note = getNoteName(noteIdx, flats);

    // Build triad by stacking thirds from the scale
    const thirdInterval = formula[(i + 2) % 7] - formula[i];
    const fifthInterval = formula[(i + 4) % 7] - formula[i];
    const third = ((thirdInterval % 12) + 12) % 12;
    const fifth = ((fifthInterval % 12) + 12) % 12;

    let quality: string;
    let suffix: string;
    let romanBase: string;

    if (third === 4 && fifth === 7) {
      quality = 'Major'; suffix = ''; romanBase = ['I','II','III','IV','V','VI','VII'][i];
    } else if (third === 3 && fifth === 7) {
      quality = 'minor'; suffix = 'm'; romanBase = ['i','ii','iii','iv','v','vi','vii'][i];
    } else if (third === 3 && fifth === 6) {
      quality = 'diminished'; suffix = '°'; romanBase = ['i°','ii°','iii°','iv°','v°','vi°','vii°'][i];
    } else if (third === 4 && fifth === 8) {
      quality = 'augmented'; suffix = '+'; romanBase = ['I+','II+','III+','IV+','V+','VI+','VII+'][i];
    } else {
      quality = 'Major'; suffix = ''; romanBase = ['I','II','III','IV','V','VI','VII'][i];
    }

    const chordNotes = [
      note,
      getNoteName(noteIdx + third, flats),
      getNoteName(noteIdx + fifth, flats),
    ];

    return {
      name: `${note}${suffix}`,
      root: note,
      quality,
      notes: chordNotes,
      degree: i + 1,
      romanNumeral: romanBase,
    };
  });
}

export function getArpeggio(root: string, quality: string, flats = false): string[] {
  const rootIdx = getNoteIndex(root);
  if (quality === 'Major') return [root, getNoteName(rootIdx + 4, flats), getNoteName(rootIdx + 7, flats)];
  if (quality === 'minor') return [root, getNoteName(rootIdx + 3, flats), getNoteName(rootIdx + 7, flats)];
  if (quality === 'diminished') return [root, getNoteName(rootIdx + 3, flats), getNoteName(rootIdx + 6, flats)];
  return [root];
}

export function getRelatedPentatonic(root: string, quality: string): string[] {
  if (quality === 'minor' || quality === 'diminished') {
    return getScale(root, 'Pentatônica Menor');
  }
  return getScale(root, 'Pentatônica Maior');
}

export interface FretNote {
  string: number; // 0-5 (low E to high E)
  fret: number;   // 0-24
  note: string;
  midi: number;
  degree?: number;
  interval?: string;
  isRoot?: boolean;
  isChordTone?: boolean;
  isTension?: boolean;
}

export function getFretboardNotes(maxFret = 24): FretNote[] {
  const notes: FretNote[] = [];
  for (let s = 0; s < 6; s++) {
    for (let f = 0; f <= maxFret; f++) {
      const midi = STANDARD_TUNING[s] + f;
      const note = getNoteName(midi, false);
      notes.push({ string: s, fret: f, note, midi });
    }
  }
  return notes;
}

export function filterByScale(allNotes: FretNote[], root: string, scaleType: string): FretNote[] {
  const scale = getScale(root, scaleType);
  const flats = useFlats(root);
  
  return allNotes
    .filter(n => {
      const noteName = getNoteName(getNoteIndex(n.note), flats);
      return scale.includes(noteName);
    })
    .map(n => {
      const noteName = getNoteName(getNoteIndex(n.note), flats);
      const degree = getScaleDegree(noteName, root, scaleType);
      const interval = getIntervalName(noteName, root);
      return {
        ...n,
        note: noteName,
        degree,
        interval,
        isRoot: noteName === root,
      };
    });
}

export function filterByNotes(allNotes: FretNote[], targetNotes: string[], root: string): FretNote[] {
  const flats = useFlats(root);
  return allNotes
    .filter(n => {
      const noteName = getNoteName(getNoteIndex(n.note), flats);
      return targetNotes.includes(noteName);
    })
    .map(n => {
      const noteName = getNoteName(getNoteIndex(n.note), flats);
      return {
        ...n,
        note: noteName,
        isRoot: noteName === root,
        isChordTone: true,
      };
    });
}

export const ALL_ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
