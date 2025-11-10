'use client';

import { useState, useEffect, useRef } from 'react';
import { AnalysisResult, Track } from '@/types/audio';
import { exportToPDF, exportToMIDI } from '@/utils/exportUtils';

interface TrackAnalysisProps {
  result: AnalysisResult;
}

export default function TrackAnalysis({ result }: TrackAnalysisProps) {
  const [selectedTrack, setSelectedTrack] = useState<number>(0);
  const sheetMusicRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Render sheet music for each track
    if (typeof window !== 'undefined') {
      result.tracks.forEach((track, index) => {
        const container = sheetMusicRefs.current[index];
        if (container) {
          renderSheetMusic(track, container);
        }
      });
    }
  }, [result]);

  const renderSheetMusic = (track: Track, container: HTMLDivElement) => {
    // Import abcjs dynamically
    import('abcjs').then((ABCJS) => {
      const abcNotation = convertToABC(track);
      container.innerHTML = '';
      ABCJS.renderAbc(container, abcNotation, {
        responsive: 'resize',
        staffwidth: 800,
      });
    });
  };

  const convertToABC = (track: Track): string => {
    let abc = `X:1\nT:${track.name}\nM:4/4\nL:1/4\nK:C\n`;

    // Convert notes to ABC notation
    if (track.notes.length === 0) {
      abc += 'z4|';
    } else {
      track.notes.slice(0, 20).forEach((note, i) => {
        abc += note.pitch.replace('#', '^').replace('b', '_');
        if ((i + 1) % 4 === 0) {
          abc += '|';
        }
      });
      if (track.notes.length % 4 !== 0) {
        abc += '|';
      }
    }

    return abc;
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(result);
      alert('PDF успешно экспортирован!');
    } catch (error) {
      alert('Ошибка экспорта PDF');
    }
  };

  const handleExportMIDI = async (trackIndex: number) => {
    try {
      await exportToMIDI(result.tracks[trackIndex]);
      alert('MIDI успешно экспортирован!');
    } catch (error) {
      alert('Ошибка экспорта MIDI');
    }
  };

  const getInstrumentEmoji = (instrument: string): string => {
    const emojiMap: { [key: string]: string } = {
      vocals: '🎤',
      piano: '🎹',
      bass: '🎸',
      guitar: '🎸',
      drums: '🥁',
      other: '🎼',
      unknown: '❓',
    };
    return emojiMap[instrument.toLowerCase()] || '🎼';
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Результаты анализа
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Длительность</p>
            <p className="text-2xl font-bold text-indigo-600">
              {Math.floor(result.duration / 60)}:{(result.duration % 60).toFixed(0).padStart(2, '0')}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Темп</p>
            <p className="text-2xl font-bold text-purple-600">
              {result.tempo} BPM
            </p>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Размер</p>
            <p className="text-2xl font-bold text-pink-600">
              {result.timeSignature}
            </p>
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Дорожки ({result.tracks.length})
          </h2>
          <button
            onClick={handleExportPDF}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            📄 Экспорт всех в PDF
          </button>
        </div>

        <div className="space-y-6">
          {result.tracks.map((track, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getInstrumentEmoji(track.instrument)}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {track.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {track.instrument} • {track.notes.length} нот
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleExportMIDI(index)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
                >
                  🎵 MIDI
                </button>
              </div>

              {/* Sheet Music */}
              <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                <div
                  ref={(el) => {
                    sheetMusicRefs.current[index] = el;
                  }}
                  className="sheet-music"
                />
              </div>

              {/* Note Preview */}
              {track.notes.length > 0 && (
                <div className="mt-4">
                  <details className="cursor-pointer">
                    <summary className="text-sm font-semibold text-gray-700 hover:text-indigo-600">
                      Просмотр нот ({track.notes.length} всего)
                    </summary>
                    <div className="mt-2 bg-gray-100 p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
                      {track.notes.slice(0, 50).map((note, i) => (
                        <span key={i} className="inline-block mr-2">
                          {note.pitch}
                        </span>
                      ))}
                      {track.notes.length > 50 && (
                        <span className="text-gray-500">... и ещё {track.notes.length - 50}</span>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
