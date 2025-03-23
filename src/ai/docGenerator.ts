import OpenAI from "openai";
import type { DetectedFunction } from "../git/tsdiffScanner";

export interface DocGenerationResult {
  function: DetectedFunction;
  jsdoc: string;
  error?: string;
}

/**
 * Cleans up JSDoc comment to ensure consistent formatting
 * @param {string} jsdoc - The JSDoc comment to clean up
 * @returns {string} Cleaned up JSDoc comment
 */
function cleanupJSDoc(jsdoc: string): string {
  // Split into lines and remove empty ones
  const lines = jsdoc.split("\n").filter((line) => line.trim());

  // Remove code block markers if present
  const cleanLines = lines.filter((line) => !line.trim().startsWith("```"));

  // Process each line
  const processedLines = cleanLines.map((line) => {
    // Remove leading/trailing whitespace
    line = line.trim();

    // Ensure proper JSDoc format
    if (line.startsWith("/**")) return line;
    if (line.startsWith("*/")) return " */";

    // Add proper indentation and asterisk if missing
    if (!line.startsWith(" *")) {
      return ` * ${line.replace(/^\*\s*/, "")}`;
    }

    return line;
  });

  // Ensure it starts with /** and ends with */
  if (!processedLines[0]?.startsWith("/**")) {
    processedLines.unshift("/**");
  }
  if (!processedLines[processedLines.length - 1]?.endsWith("*/")) {
    processedLines.push(" */");
  }

  return processedLines.join("\n");
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
              "You are a technical documentation expert. Generate a JSDoc comment for the following function. Follow these rules strictly:\n" +
              "1. Start with /** and end with */\n" +
              "2. Include a clear description of what the function does\n" +
              "3. Include @param tags for each parameter with types and descriptions\n" +
              "4. Include @returns tag with type and description if the function returns something\n" +
              "5. Include @throws tag if the function can throw errors\n" +
              "6. DO NOT include the function declaration itself\n" +
              "7. DO NOT wrap the output in ```javascript or any other code block\n" +
              "8. Make sure each line starts with a * after the initial /**\n" +
              "Example output format:\n" +
              "/**\n" +
              " * Calculates the sum of two numbers\n" +
              " * @param {number} a - First number to add\n" +
              " * @param {number} b - Second number to add\n" +
              " * @returns {number} Sum of a and b\n" +
              " */",
          },
          {
            role: "user",
            content: func.code,
          },
        ],
        temperature: 0.7,
      });

      const rawJSDoc = completion.choices[0]?.message?.content || "";
      const cleanedJSDoc = cleanupJSDoc(rawJSDoc);

      results.push({
        function: func,
        jsdoc: cleanedJSDoc,
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
