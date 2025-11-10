export interface Note {
  pitch: string;
  duration: number;
  time: number;
  velocity: number;
}

export interface Track {
  name: string;
  instrument: string;
  notes: Note[];
  midiData?: string;
}

export interface AnalysisResult {
  tracks: Track[];
  duration: number;
  tempo: number;
  timeSignature: string;
}

export type InstrumentType =
  | 'vocals'
  | 'piano'
  | 'bass'
  | 'guitar'
  | 'drums'
  | 'other'
  | 'unknown';
