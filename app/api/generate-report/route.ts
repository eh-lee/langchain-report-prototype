import { NextResponse } from 'next/server';
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const transcript = body.transcript; // 클라이언트에서 보낸 수업 텍스트

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o",
      temperature: 0.1,
    });

    const prompt = PromptTemplate.fromTemplate(
      `당신은 유능한 학습 분석 전문가입니다.
      아래 학생과 선생님의 수업 대화 내용을 바탕으로, 핵심적인 내용만 요약하여 데일리 학습 리포트를 생성해주세요.

      [수업 대화 내용]
      {transcript}

      [리포트 결과]
      `
    );

    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    const report = await chain.invoke({
      transcript: transcript,
    });

    return NextResponse.json({ report });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}