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

    // --- Chat completion only (no moderation)
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
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
  }
}
