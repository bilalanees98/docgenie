import inquirer from "inquirer";
import { createPatch } from "diff";
import chalk from "chalk";
import { DocGenerationResult } from "../ai/docGenerator";
import { applyChange } from "./fileModifier.js";

export interface JSDocDiff {
  filePath: string;
  functionName: string;
  originalCode: string;
  proposedJSDoc: string;
  lineNumber: number;
}

/**
 * Removes the diff header lines from the patch output
 */
function cleanupDiffOutput(diffOutput: string): string {
  const lines = diffOutput.split("\n");
  // Skip the first 4 lines which contain:
  // - Index header
  // - ===== separator
  // - --- old file
  // - +++ new file
  return lines.slice(4).join("\n");
}

/**
 * Converts DocGenerationResults to JSDocDiffs for presentation
 */
export function convertResultsToDiffs(
  results: DocGenerationResult[],
): JSDocDiff[] {
  return results.map((result) => ({
    filePath: result.function.filePath,
    functionName: result.function.name,
    originalCode: result.function.code,
    proposedJSDoc: result.jsdoc,
    lineNumber: result.function.lineNumber,
  }));
}

/**
 * Presents JSDoc diffs to the user and returns the paths of files with accepted changes
 */
export async function presentDiffs(diffs: JSDocDiff[]): Promise<string[]> {
  const acceptedFiles = new Set<string>();
  // Track line number adjustments per file
  const lineAdjustments = new Map<string, number>();
  let processedCount = 0;

  for (const diff of diffs) {
    processedCount++;

    // Get the current line adjustment for this file
    const currentAdjustment = lineAdjustments.get(diff.filePath) || 0;

    // Adjust the line number based on previous changes
    const adjustedDiff = {
      ...diff,
      lineNumber: diff.lineNumber + currentAdjustment,
    };

    // Show colorized diff
    console.log(
      chalk.cyan(`\nFile: ${adjustedDiff.filePath}:${adjustedDiff.lineNumber}`),
    );
    console.log(chalk.yellow(`Function: ${adjustedDiff.functionName}\n`));

    // Show the diff
    const oldStr = adjustedDiff.originalCode;
    const newStr = `${adjustedDiff.proposedJSDoc}\n${adjustedDiff.originalCode}`;
    const diffResult = createPatch("", oldStr, newStr, "", "");

    // Clean up and color the diff output
    const cleanDiff = cleanupDiffOutput(diffResult);
    console.log(
      cleanDiff
        .split("\n")
        .map((line) => {
          if (line.startsWith("+")) return chalk.green(line);
          if (line.startsWith("-")) return chalk.red(line);
          return line;
        })
        .join("\n"),
    );

    // Ask for confirmation
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do with this change?",
        choices: [
          { name: "Accept", value: "accept" },
          { name: "Skip", value: "skip" },
          { name: "View full context", value: "context" },
          { name: "Quit", value: "quit" },
        ],
      },
    ]);
    switch (action) {
      case "accept":
        try {
          await applyChange(adjustedDiff);
          acceptedFiles.add(adjustedDiff.filePath);
          console.log(chalk.green("\n✓ Change applied successfully!\n"));

          // Update line adjustment for this file
          const jsdocLineCount = adjustedDiff.proposedJSDoc.split("\n").length;
          lineAdjustments.set(
            adjustedDiff.filePath,
            currentAdjustment + jsdocLineCount,
          );
        } catch (error) {
          console.error(chalk.red("\n✗ Failed to apply change:"), error);
        }
        break;

      case "quit":
        console.log(chalk.yellow("\nQuitting early. Summary:"));
        console.log(
          chalk.cyan(
            `- Processed ${processedCount} out of ${diffs.length} functions`,
          ),
        );
        console.log(
          chalk.cyan(`- Applied changes to ${acceptedFiles.size} files`),
        );
        console.log(chalk.yellow("Remaining changes were skipped."));
        return Array.from(acceptedFiles);

      case "context":
        // TODO: Implement showing more context from the file
        console.log(chalk.yellow("\nContext view not implemented yet."));
        break;
    }
  }

  return Array.from(acceptedFiles);
}
