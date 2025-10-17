This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://www.google.com/search?q=%5Bhttps://nextjs.org/docs/app/api-reference/cli/create-next-app%5D\(https://nextjs.org/docs/app/api-reference/cli/create-next-app\)).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://www.google.com/search?q=%5Bhttps://nextjs.org/docs/app/building-your-application/optimizing/fonts%5D\(https://nextjs.org/docs/app/building-your-application/optimizing/fonts\)) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

-----

## Learn More

To learn more about Next.js, take a look at the following resources:

  - [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
  - [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome\!

-----

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

-----

## 🤖 Gemini 모델 연동

이 프로젝트는 Google Generative AI의 Gemini 모델을 사용합니다. API 키로 호출 가능한 모델 목록은 아래 엔드포인트를 통해 확인할 수 있습니다.

### 사용 가능한 모델 목록 확인

아래 URL의 `YOUR_API_KEY` 부분을 실제 발급받은 API 키로 변경하여 브라우저나 API 클라이언트에서 GET 요청을 보내세요.

```bash
https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY
```

### 응답 결과 예시

요청이 성공하면, 사용 가능한 모델 객체들이 배열 형태로 반환됩니다.

```json
{
  "models": [
    {
      "name": "models/gemini-1.5-pro-latest",
      "version": "001",
      "displayName": "Gemini 1.5 Pro",
      "description": "Google's most capable model for multi-modal tasks.",
      "inputTokenLimit": 1048576,
      "outputTokenLimit": 8192,
      "supportedGenerationMethods": [
        "generateContent",
        "countTokens"
      ],
      "temperature": 1.0,
      "topP": 0.95,
      "topK": 64
    }
  ]
}
```

### 적용 방법

응답받은 모델 객체에서 **`name`** 키의 값(예: `gemini-1.5-pro-latest`)을 복사하여, LangChain의 `ChatGoogleGenerativeAI` 인스턴스를 생성할 때 `model` 속성의 값으로 사용합니다.

```typescript
// 예시: src/app/api/generate-report/route.ts

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  // API 응답에서 확인한 'name' 값을 여기에 붙여넣습니다.
  model: "gemini-1.5-pro-latest", 
});
```