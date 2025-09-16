// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatMessage } from "@/types/openai";

// Ensure key exists
if (!process.env.OPENAI_API_KEY) {
  throw new Error("❌ Missing OPENAI_API_KEY in environment variables");
}

// OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Handle POST request
export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "No valid messages provided" },
        { status: 400 }
      );
    }

    // --- 1) Moderation step (last 3 user messages)
    const userText = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .slice(-3)
      .join("\n");

    const moderation = await client.moderations.create({
      model: "omni-moderation-latest",
      input: userText,
    });

    if (moderation.results?.[0]?.flagged) {
      return NextResponse.json(
        { error: "Input flagged by moderation" },
        { status: 400 }
      );
    }

    // --- 2) Chat completion
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // you can swap to gpt-4o if you have access
      messages,
      max_tokens: 800,
      temperature: 0.2,
    });

    return NextResponse.json(completion);
 } catch (err: unknown) {
  const error = err as Error;
  console.error("❌ OpenAI API error:", error);

  return NextResponse.json(
    { error: error.message ?? "Server error" },
    { status: 500 }
  );
 }}
 
