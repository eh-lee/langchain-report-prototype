"use client";

import { useState } from "react";

// API 응답 데이터의 타입을 정의합니다. (API의 zodSchema와 일치)
interface ReportData {
  learningMetrics: {
    [key: string]: {
      score: number;
      briefing: string;
    };
  };
  classSummary: {
    goal: string;
    review: string;
    newContent: string;
  };
  keyContents: string;
  finalComment: string;
}

// 별점 표시를 위한 간단한 컴포넌트
const StarRating = ({ score }: { score: number }) => {
  const fullStars = Math.floor(score);
  const halfStar = score % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div style={{ color: '#f5b327', fontSize: '24px' }}>
      {'★'.repeat(fullStars)}
      {halfStar && '½'}
      {'☆'.repeat(emptyStars)}
      <span style={{ color: '#000', fontSize: '16px', marginLeft: '8px' }}>({score}/5.0)</span>
    </div>
  );
};

// 메인 페이지 컴포넌트
export default function Home() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);
    setReportData(null);

    try {
      const response = await fetch('/심지혁_전재한_AP_Cal.json');
      if (!response.ok) throw new Error('심지혁_전재한_AP_Cal.json 파일을 찾을 수 없습니다.');
      const transcript = await response.json();

      const apiResponse = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'API에서 오류가 발생했습니다.');
      }

      const data: ReportData = await apiResponse.json();
      setReportData(data);
    
    // ⭐️ 이 부분이 수정되었습니다 ⭐️
    } catch (err) {
      console.error("리포트 생성 실패:", err);
      // err가 Error 인스턴스인지 확인하여 안전하게 message 속성에 접근합니다.
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const metricTitles: { [key: string]: string } = {
    homeworkCompletion: "숙제 진행도",
    classAttitude: "수업 태도",
    classAchievement: "수업 성취도",
    participation: "수업 참여도",
  };

  return (
    <main>
      <h1>학습 리포트 생성 프로토타입 🤖</h1>
      <p>아래 버튼을 누르면 심지혁 학생과 전재한 선생님이 진행한 AP Calculus 수업에 대한 리포트를 생성합니다.</p>
      
      <button onClick={handleGenerateReport} disabled={isLoading}>
        {isLoading ? "리포트 생성 중..." : "예시 리포트 생성"}
      </button>

      {isLoading && <div className="loading">리포트를 작성하고 있습니다...</div>}
      {error && <div className="error-box">오류 발생: {error}</div>}

      {reportData && (
        <div className="report-container text-gray-900">
          <h2>📊 학습 지표</h2>
          {Object.entries(reportData.learningMetrics).map(([key, value]) => (
            <div className="metric-item" key={key}>
              <h3>{metricTitles[key] || key}</h3>
              <StarRating score={value.score} />
              <p>{value.briefing}</p>
            </div>
          ))}
          
          <hr/>

          <h2>📝 수업 요약</h2>
          <div className="summary-item">
            <h3>오늘 수업 목표</h3>
            <p>{reportData.classSummary.goal}</p>
          </div>
          <div className="summary-item">
            <h3>오늘 복습한 내용</h3>
            <p>{reportData.classSummary.review}</p>
          </div>
          <div className="summary-item">
            <h3>오늘 새로 학습한 내용</h3>
            <p>{reportData.classSummary.newContent}</p>
          </div>
          
          <hr/>
          
          <h2>📖 수업의 주요 내용</h2>
          <p>{reportData.keyContents}</p>
          
          <hr/>
          
          <h2>⭐ 총평</h2>
          <p>{reportData.finalComment}</p>
        </div>
      )}
    </main>
  );
}