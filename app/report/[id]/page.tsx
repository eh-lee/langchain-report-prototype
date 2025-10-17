"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// 기존 page.tsx에 있던 타입과 컴포넌트를 그대로 가져옵니다.
interface ReportData {
  learningMetrics: { [key: string]: { score: number; briefing: string; } };
  classSummary: { goal: string; review: string; newContent: string; };
  keyContents: string; finalComment: string;
}

const StarRating = ({ score }: { score: number }) => {
  const fullStars = Math.floor(score);
  const halfStar = score % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return ( <div style={{ color: '#f5b327', fontSize: '24px' }}> {'★'.repeat(fullStars)} {halfStar && '½'} {'☆'.repeat(emptyStars)} <span style={{ color: '#000', fontSize: '16px', marginLeft: '8px' }}>({score}/5.0)</span> </div> );
};

const metricTitles: { [key: string]: string } = {
  homeworkCompletion: "숙제 진행도", classAttitude: "수업 태도",
  classAchievement: "수업 성취도", participation: "수업 참여도",
};

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    if (id) {
      // sessionStorage에서 리포트 데이터 불러오기
      const storedReport = sessionStorage.getItem(`report_${id}`);
      if (storedReport) {
        setReportData(JSON.parse(storedReport));
      }
    }
  }, [id]);

  if (!reportData) {
    return <main><h1>리포트 데이터를 불러오는 중...</h1><p>이 페이지는 리포트 보기 버튼을 통해 열어야 합니다.</p></main>;
  }

  return (
    <main className='text-gray-900'>
      <h1 className='text-white font-bold text-2xl'>학습 리포트 📄</h1>
      <div className="report-container">
        <h2>📊 학습 지표</h2>
        {Object.entries(reportData.learningMetrics).map(([key, value]) => (
          <div className="metric-item" key={key}>
            <h3>{metricTitles[key] || key}</h3> <StarRating score={value.score} /> <p>{value.briefing}</p>
          </div>
        ))}
        <hr/>
        <h2>📝 수업 요약</h2>
        <div className="summary-item"><h3>오늘 수업 목표</h3><p>{reportData.classSummary.goal}</p></div>
        <div className="summary-item"><h3>오늘 복습한 내용</h3><p>{reportData.classSummary.review}</p></div>
        <div className="summary-item"><h3>오늘 새로 학습한 내용</h3><p>{reportData.classSummary.newContent}</p></div>
        <hr/>
        <h2>📖 수업의 주요 내용</h2><p>{reportData.keyContents}</p>
        <hr/>
        <h2>⭐ 총평</h2><p>{reportData.finalComment}</p>
      </div>
    </main>
  );
}