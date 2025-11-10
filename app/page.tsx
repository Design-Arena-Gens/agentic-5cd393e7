'use client';

import { useState } from 'react';
import AudioUploader from '@/components/AudioUploader';
import TrackAnalysis from '@/components/TrackAnalysis';
import { AnalysisResult } from '@/types/audio';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setLoading(false);
  };

  const handleAnalysisStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎵 Audio Sheet Music Analyzer
          </h1>
          <p className="text-xl text-gray-600">
            Загрузите MP3 или YouTube ссылку для анализа композиции
          </p>
        </div>

        <AudioUploader
          onAnalysisComplete={handleAnalysisComplete}
          onAnalysisStart={handleAnalysisStart}
          onError={handleError}
        />

        {loading && (
          <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-lg text-gray-700">Анализируем аудио...</p>
          </div>
        )}

        {error && (
          <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Ошибка:</p>
            <p>{error}</p>
          </div>
        )}

        {analysisResult && !loading && (
          <TrackAnalysis result={analysisResult} />
        )}
      </div>
    </main>
  );
}
