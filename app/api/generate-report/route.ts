import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";

interface TranscriptEntry {
  sentence: string;
  speaker_name: string;
}

const reportSchema = {
  type: "object",
  properties: {
    learningMetrics: {
      type: "object",
      properties: {
        homeworkCompletion: {
          type: "object",
          properties: {
            score: { type: "number", description: "학생 숙제 진행도 별점 (0.5 단위, 1.0 ~ 5.0)" },
            briefing: { type: "string", description: "숙제 진행도에 대한 100자 내외 브리핑" },
          },
          required: ["score", "briefing"],
        },
        classAttitude: {
          type: "object",
          properties: {
            score: { type: "number", description: "학생 수업 태도 별점 (0.5 단위, 1.0 ~ 5.0)" },
            briefing: { type: "string", description: "수업 태도에 대한 100자 내외 브리핑" },
          },
          required: ["score", "briefing"],
        },
        classAchievement: {
          type: "object",
          properties: {
            score: { type: "number", description: "학생 수업 성취도 별점 (0.5 단위, 1.0 ~ 5.0)" },
            briefing: { type: "string", description: "수업 성취도에 대한 100자 내외 브리핑" },
          },
          required: ["score", "briefing"],
        },
        participation: {
          type: "object",
          properties: {
            score: { type: "number", description: "학생 수업 참여도 별점 (0.5 단위, 1.0 ~ 5.0)" },
            briefing: { type: "string", description: "수업 참여도에 대한 100자 내외 브리핑" },
          },
          required: ["score", "briefing"],
        },
      },
    },
    classSummary: {
      type: "object",
      properties: {
        goal: { type: "string", description: "오늘 수업의 목표" },
        review: { type: "string", description: "오늘 복습한 내용" },
        newContent: { type: "string", description: "오늘 새로 학습한 내용" },
      },
      required: ["goal", "review", "newContent"],
    },
    keyContents: { type: "string", description: "수업에서 다룬 주요 내용 요약" },
    finalComment: { type: "string", description: "학생에 대한 격려와 칭찬을 담은 짧은 총평" },
  },
  required: ["learningMetrics", "classSummary", "keyContents", "finalComment"],
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const transcriptData: TranscriptEntry[] = body.transcript;

    if (!transcriptData || transcriptData.length === 0) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    const formattedTranscript = transcriptData
      .map(entry => {
        const speaker = entry.speaker_name === "David Shim" ? "학생" : "선생님";
        return `${speaker}: ${entry.sentence}`;
      })
      .join("\n");

    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "models/gemini-2.5-pro",
      temperature: 0.2,
    });
    
    const structuredLLM = model.withStructuredOutput(reportSchema);

    const prompt = PromptTemplate.fromTemplate(
      `당신은 학생의 학습 데이터를 분석하여 학부모에게 전달할 리포트를 작성하는 AI 전문가입니다.
      아래 제공되는 학생과 선생님의 수업 대화 내용을 바탕으로, 요청된 JSON 형식에 맞춰 학습 리포트를 생성해주세요.

      [수업 대화 내용]
      {transcript}`
    );

    const chain = prompt.pipe(structuredLLM);

    const report = await chain.invoke({
      transcript: formattedTranscript,
    });

    return NextResponse.json(report);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate report", details: (error as Error).message },
      { status: 500 }
    );
  }
}