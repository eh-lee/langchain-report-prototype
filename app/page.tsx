"use client";

import { useState, useEffect } from "react";

// The types defined for our data structures
interface ReportData {
  learningMetrics: { [key: string]: { score: number; briefing: string; } };
  classSummary: { goal: string; review: string; newContent: string; };
  keyContents: string;
  finalComment: string;
}

interface ApiTranscript {
  id: string;
  title: string;
  date: string;
}

type TranscriptStatus = 'idle' | 'loading' | 'generated';
interface Transcript extends ApiTranscript {
  status: TranscriptStatus;
  reportData?: ReportData;
}

export default function Home() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranscripts = async () => {
      try {
        const response = await fetch('/api/fireflies/transcripts');
        if (!response.ok) throw new Error('Fireflies 대화 목록을 불러오지 못했습니다.');
        
        const data: ApiTranscript[] = await response.json();

        // ⭐️ FIX: Explicitly type the 'initialTranscripts' variable as Transcript[]
        const initialTranscripts: Transcript[] = data.map((t) => ({ ...t, status: 'idle' }));
        setTranscripts(initialTranscripts);

      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchTranscripts();
  }, []);

  const handleGenerateReport = async (transcriptId: string) => {
    setTranscripts(prev => prev.map(t => t.id === transcriptId ? { ...t, status: 'loading' } : t));
    setError(null);

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptId, studentName: "David Shim" }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || '리포트 생성에 실패했습니다.');
      }
      
      const report: ReportData = await response.json();

      setTranscripts(prev => prev.map(t => 
        t.id === transcriptId ? { ...t, status: 'generated', reportData: report } : t
      ));

    } catch (err) {
      if (err instanceof Error) setError(err.message);
      setTranscripts(prev => prev.map(t => t.id === transcriptId ? { ...t, status: 'idle' } : t));
    }
  };

  const handleViewReport = (transcriptId: string) => {
    const transcript = transcripts.find(t => t.id === transcriptId);
    if (transcript && transcript.reportData) {
      sessionStorage.setItem(`report_${transcriptId}`, JSON.stringify(transcript.reportData));
      window.open(`/report/${transcriptId}`, '_blank');
    }
  };

  return (
    <main>
      <h1>Fireflies.ai 학습 리포트 생성기 🚀</h1>
      
      {error && <div className="error-box">오류 발생: {error}</div>}

      <div className="transcript-list">
        <h2>대화 목록</h2>
        {isLoadingList ? (
          <p>Fireflies.ai에서 대화 목록을 불러오는 중입니다...</p>
        ) : (
          transcripts.map(transcript => (
            <div key={transcript.id} className="transcript-item">
              <span>{transcript.title}</span>
              {transcript.status === 'idle' && (
                <button onClick={() => handleGenerateReport(transcript.id)}>
                  리포트 생성
                </button>
              )}
              {transcript.status === 'loading' && (
                <button disabled>생성 중...</button>
              )}
              {transcript.status === 'generated' && (
                <button className="view-button" onClick={() => handleViewReport(transcript.id)}>
                  리포트 보기
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}