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
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
      },
    });

    return response.text ?? "Sorry, Gemini did not return a response.";
  } catch (err) {
    console.error("Gemini Error:", err);
    return "Sorry, I could not generate a response.";
  }
}

export async function recommendMoviesListWithAI(
  prompt: string
): Promise<{ reason: string; titles: string[] }> {
  const systemPrompt = `
You are a helpful AI movie and TV show recommender.

When the user describes the kind of content they want, respond with:

1. A short, simple paragraph (2–3 lines) explaining why these 18 titles match the user's request.
   - Use clear, friendly language.
   - Avoid technical or abstract explanations.

2. Then list exactly 18 titles, sorted from the most relevant to the least relevant based on the user's prompt.
   - Include both movies and TV shows if appropriate.
   - Only list the title names (no years, no types, no numbering, no extra info).
   - One title per line.

Format:
Reason:
<easy-to-understand explanation here>

Titles:
<title 1>
<title 2>
...
`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nUser: ${prompt}` }],
        },
      ],
    });

    const raw = result.text ?? "";

    const reasonMatch = raw.match(/Reason:\s*([\s\S]*?)\n\s*Titles:/i);
    const titlesMatch = raw.match(/Titles:\s*([\s\S]*)/i);

    const reason =
      reasonMatch?.[1]?.trim() || "Here's a curated list based on your taste.";
    const titles =
      titlesMatch?.[1]
        ?.split("\n")
        .map((line) => line.trim())
        .filter(Boolean) ?? [];

    return { reason, titles };
  } catch (error) {
    console.error("Gemini AI error:", error);
    return { reason: "", titles: [] };
  }
}
