"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askGemini(
  prompt: string,
  title: string
): Promise<string> {
  const systemPrompt = `
    You are a smart, friendly AI movie assistant. Assume the user is asking about the movie titled: "${title}".
    
    Guidelines:
    - Always be helpful, clear, and direct.
    - If the user asks about the ending, twists, or spoilers — only include them if clearly requested (e.g. "what is the ending", "tell me the twist", "spoilers please").
    - Use bullet points only if the answer includes multiple parts or lists.
    - Do not repeat the movie title unless necessary.
    - Keep your tone casual but informative.
    - Suggest 1–2 other related things the user can ask about (only if it fits naturally).
    
    If the user greets or says "hello", suggest helpful things they can ask about this movie (e.g. plot, cast, characters, themes, trivia).
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nUser: ${prompt}` }],
        },
      ],
    });

    return response.text ?? "Sorry, Gemini did not return a response.";
  } catch (err) {
    console.error("Gemini Error:", err);
    return "Sorry, I could not generate a response.";
  }
}
