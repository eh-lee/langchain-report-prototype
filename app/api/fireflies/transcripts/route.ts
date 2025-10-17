import { NextResponse } from "next/server";

const FIREFLIES_API_URL = "https://api.fireflies.ai/graphql";

// Fireflies에서 대화 목록을 가져오는 GraphQL 쿼리
const transcriptsQuery = {
  query: `
    query Transcripts {
      transcripts {
        id
        title
        date
      }
    }
  `,
};

export async function GET() {
  const apiKey = process.env.FIREFLIES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Fireflies API key is not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(FIREFLIES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(transcriptsQuery)
    });

    const data = await response.json();
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return NextResponse.json(data.data.transcripts);
  } catch (error) {
    console.error("Error fetching transcripts from Fireflies:", error);
    return NextResponse.json({ error: "Failed to fetch transcripts from Fireflies" }, { status: 500 });
  }
}