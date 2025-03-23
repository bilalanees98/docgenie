import * as fs from "fs";
import type { JSDocDiff } from "./diffPresenter";

/**
 * Applies a single JSDoc change to a file
 */
export async function applyChange(diff: JSDocDiff): Promise<void> {
  try {
    // Read the file content
    const content = fs.readFileSync(diff.filePath, "utf-8");
    const lines = content.split("\n");

    // Insert JSDoc lines before the function
    const insertPosition = diff.lineNumber - 1;
    const jsdocLines = diff.proposedJSDoc.split("\n");

    // Insert JSDoc lines before the function
    lines.splice(insertPosition, 0, ...jsdocLines);

    // Write back to file
    fs.writeFileSync(diff.filePath, lines.join("\n"), "utf-8");
  } catch (error) {
    console.error(`Failed to modify ${diff.filePath}:`, error);
    throw error;
  }
}
