import OpenAI from "openai";
import type { DetectedFunction } from "../git/diffScanner";

interface DocGenerationResult {
  function: DetectedFunction;
  jsdoc: string;
  error?: string;
}

export async function generateDocs(
  functions: DetectedFunction[]
): Promise<DocGenerationResult[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const results: DocGenerationResult[] = [];

  for (const func of functions) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a technical documentation expert. Generate a JSDoc comment for the following function. Include parameter descriptions, return type, and a clear description of what the function does. Use proper JSDoc syntax.",
          },
          {
            role: "user",
            content: func.code,
          },
        ],
        temperature: 0.7,
      });

      const jsdoc = completion.choices[0]?.message?.content || "";
      results.push({
        function: func,
        jsdoc,
      });
    } catch (error) {
      results.push({
        function: func,
        jsdoc: "",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  return results;
}
