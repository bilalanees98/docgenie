import simpleGit from "simple-git";
import * as fs from "fs";
import * as ts from "typescript";
import {
  FunctionInfo,
  isProcessableFile,
  isFunctionLike,
  createSourceFile,
  getFunctionInfo,
} from "../utils/tsUtils.js";

// DetectedFunction requires the code property
export type DetectedFunction = FunctionInfo & { code: string };

interface FileDiff {
  filePath: string;
  hunks: Array<{
    content: string;
    newStart: number;
    newLines: number;
  }>;
}

export async function scanGitDiffTS(
  stagedOnly: boolean = false,
): Promise<DetectedFunction[]> {
  const cwd = process.cwd();
  const git = simpleGit({ baseDir: cwd });
  const diffCommand = stagedOnly ? ["--staged"] : [];
  const diff = await git.diff([...diffCommand, "-U1"]);

  if (!diff) {
    return [];
  }

  const fileDiffs = parseGitDiff(diff);
  const detectedFunctions: DetectedFunction[] = [];

  for (const fileDiff of fileDiffs) {
    if (!isProcessableFile(fileDiff.filePath)) {
      continue;
    }

    try {
      const fileContent = fs.readFileSync(fileDiff.filePath, "utf-8");
      const sourceFile = createSourceFile(fileDiff.filePath, fileContent);

      for (const hunk of fileDiff.hunks) {
        const functions = findFunctionsInHunk(
          sourceFile,
          hunk.newStart,
          hunk.newStart + hunk.newLines,
        ) as DetectedFunction[]; // We know these will have code
        detectedFunctions.push(...functions);
      }
    } catch (error) {
      console.warn(`Failed to parse ${fileDiff.filePath}:`, error);
    }
  }

  return detectedFunctions.filter((fn) => !fn.hasJSDoc);
}

function parseGitDiff(diff: string): FileDiff[] {
  const files: FileDiff[] = [];
  let currentFile: FileDiff | null = null;

  const lines = diff.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("diff --git")) {
      if (currentFile) {
        files.push(currentFile);
      }
      const filePath = line.split(" b/")[1];
      currentFile = { filePath, hunks: [] };
      continue;
    }

    if (line.startsWith("@@")) {
      const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
      if (match && currentFile) {
        const newStart = parseInt(match[1]);
        const newLines = parseInt(match[2] || "1");
        let content = "";

        while (
          i + 1 < lines.length &&
          !lines[i + 1].startsWith("diff --git") &&
          !lines[i + 1].startsWith("@@")
        ) {
          i++;
          const contentLine = lines[i];
          if (contentLine.startsWith("+")) {
            content += contentLine.slice(1) + "\n";
          }
        }

        currentFile.hunks.push({
          content,
          newStart,
          newLines,
        });
      }
    }
  }

  if (currentFile) {
    files.push(currentFile);
  }

  return files;
}

function findFunctionsInHunk(
  sourceFile: ts.SourceFile,
  startLine: number,
  endLine: number,
): FunctionInfo[] {
  const detected: FunctionInfo[] = [];

  function visit(node: ts.Node) {
    if (isFunctionLike(node)) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(),
      );
      const lineNumber = line + 1;

      if (lineNumber >= startLine && lineNumber <= endLine) {
        detected.push(getFunctionInfo(node, sourceFile, true));
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return detected;
}
