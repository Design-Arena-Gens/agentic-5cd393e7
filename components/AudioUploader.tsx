'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AnalysisResult } from '@/types/audio';
import { analyzeAudioFile, analyzeYouTubeURL } from '@/utils/audioAnalyzer';

interface AudioUploaderProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onAnalysisStart: () => void;
  onError: (error: string) => void;
}

export default function AudioUploader({
  onAnalysisComplete,
  onAnalysisStart,
  onError,
}: AudioUploaderProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [processing, setProcessing] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.type.includes('audio')) {
      onError('Пожалуйста, загрузите аудио файл (MP3, WAV, и т.д.)');
      return;
    }

    setProcessing(true);
    onAnalysisStart();

    try {
      const result = await analyzeAudioFile(file);
      onAnalysisComplete(result);
    } catch (error) {
      onError(`Ошибка анализа файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
    },
    maxFiles: 1,
    disabled: processing,
  });

  const handleYouTubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setProcessing(true);
    onAnalysisStart();

    try {
      const result = await analyzeYouTubeURL(youtubeUrl);
      onAnalysisComplete(result);
    } catch (error) {
      onError(`Ошибка анализа YouTube видео: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* File Upload */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Загрузить MP3 файл
          </h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-indigo-400 bg-gray-50'
            } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="text-6xl mb-4">🎵</div>
            {isDragActive ? (
              <p className="text-lg text-indigo-600">Перетащите файл сюда...</p>
            ) : (
              <div>
                <p className="text-lg text-gray-700 mb-2">
                  Перетащите MP3 файл или нажмите для выбора
                </p>
                <p className="text-sm text-gray-500">
                  Поддерживаются: MP3, WAV, OGG, M4A
                </p>
              </div>
            )}
          </div>
        </div>

        {/* YouTube URL */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            YouTube ссылка
          </h2>
          <form onSubmit={handleYouTubeSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={processing}
              />
            </div>
            <button
              type="submit"
              disabled={processing || !youtubeUrl.trim()}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Анализировать
            </button>
          </form>
          <div className="mt-6 text-sm text-gray-600 space-y-2">
            <p className="font-semibold">Примечание:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Вставьте полную URL YouTube видео</li>
              <li>Анализ может занять несколько минут</li>
              <li>Работает только с публичными видео</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
