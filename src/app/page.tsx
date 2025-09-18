/* eslint-disable @next/next/no-img-element */
// src/app/page.tsx
"use client";
//origin

import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  image?: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input && !image) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("input", input);
    if (image) formData.append("image", image);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: input || "Sent an image",
        image: preview || undefined,
      },
    ]);

    setInput("");
    setImage(null);
    setPreview(null);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply },
    ]);

    setLoading(false);
  }

  function handleImageSelect(file: File | null) {
    setImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  return (
    <main className="flex flex-col h-screen bg-gray-100">
      {/* Chat history */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs sm:max-w-md p-3 rounded-2xl shadow ${
                m.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-white text-gray-900 rounded-bl-none"
              }`}
            >
              {m.image && (
                <img
                  src={m.image}
                  alt="user upload"
                  className="mb-2 rounded-lg max-h-48 object-cover"
                />
              )}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl shadow rounded-bl-none">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="p-4 border-t bg-white flex flex-col gap-2">
        {preview && (
          <div className="relative w-32">
            <img
              src={preview}
              alt="preview"
              className="rounded-lg shadow max-h-32 object-cover"
            />
            <button
              onClick={() => handleImageSelect(null)}
              className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            className="flex-1 text-black border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <input
            id="file"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageSelect(e.target.files?.[0] || null)}
            disabled={loading}
          />
          <label
            htmlFor="file"
            className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
          >
            📷
          </label>

          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
