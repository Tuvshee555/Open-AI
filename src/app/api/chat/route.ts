// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
// import { ChatMessage } from "@/types/openai";

// OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const formData = await req.formData()
  const input = formData.get("input") as string
  const image = formData.get("image") as File | null


  try {

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

    if(input) {
      messages.push({role: "user", content: input})
    }

    if(image) {
      const buffer = Buffer.from(await image.arrayBuffer())
      const base64 = buffer.toString("base64")

      messages.push({
        role: "user",
        content: [
          {type: "text", text: input || "Whats in this image?"},
          {type: "image_url",
            image_url: {
              url: `data:${image.type};base64,${base64}`
            }
          }
        ]
      })
    }

   const completion = await client.chat.completions.create({
  model: "gpt-4o-mini", // 👈 correct model
  messages,
});


    return NextResponse.json({
      reply: completion.choices[0].message.content
    })



  } catch (err: unknown) {
    const error = err as Error;
    console.error("❌ OpenAI API error:", error);

    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 500 }
    );
  }
}
