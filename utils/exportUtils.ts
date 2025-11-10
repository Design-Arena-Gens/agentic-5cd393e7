import { Track, AnalysisResult } from '@/types/audio';
import { Midi } from '@tonejs/midi';

export async function exportToMIDI(track: Track): Promise<void> {
  const midi = new Midi();
  const midiTrack = midi.addTrack();

  track.notes.forEach((note) => {
    midiTrack.addNote({
      midi: pitchToMidi(note.pitch),
      time: note.time,
      duration: note.duration,
      velocity: note.velocity / 127,
    });
  });

  const midiArray = midi.toArray();
  const arrayBuffer = new Uint8Array(midiArray).buffer;
  const blob = new Blob([arrayBuffer], { type: 'audio/midi' });
  downloadBlob(blob, `${track.name}.mid`);
}

export async function exportToPDF(result: AnalysisResult): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.text('Sheet Music Analysis', 105, yPosition, { align: 'center' });
  yPosition += 15;

  // Metadata
  doc.setFontSize(12);
  doc.text(`Duration: ${Math.floor(result.duration / 60)}:${(result.duration % 60).toFixed(0).padStart(2, '0')}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Tempo: ${result.tempo} BPM`, 20, yPosition);
  yPosition += 7;
  doc.text(`Time Signature: ${result.timeSignature}`, 20, yPosition);
  yPosition += 15;

  // Tracks
  result.tracks.forEach((track, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text(`${track.name} (${track.instrument})`, 20, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.text(`Notes: ${track.notes.length}`, 20, yPosition);
    yPosition += 7;

    // Sample notes
    const notesPreview = track.notes
      .slice(0, 30)
      .map((n) => n.pitch)
      .join(' ');
    const lines = doc.splitTextToSize(notesPreview, 170);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * 5 + 10;
  });

  doc.save('sheet_music_analysis.pdf');
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function pitchToMidi(pitch: string): number {
  const noteMap: { [key: string]: number } = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };

  const noteName = pitch[0];
  const octave = parseInt(pitch[pitch.length - 1]);
  let midiNote = noteMap[noteName] + (octave + 1) * 12;

  // Handle sharps and flats
  if (pitch.includes('#')) {
    midiNote += 1;
  } else if (pitch.includes('b')) {
    midiNote -= 1;
  }

  return midiNote;
}
