import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// 创建OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 请求OpenAI API
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    messages,
  });

  // 转换为流
  const stream = OpenAIStream(response);

  // 返回一个StreamingTextResponse，它是一个ReadableStream
  return new StreamingTextResponse(stream);
}