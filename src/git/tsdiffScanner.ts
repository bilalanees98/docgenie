import simpleGit from "simple-git";
import * as ts from "typescript";
import * as fs from "fs";

export interface DetectedFunction {
  name: string;
  code: string;
  filePath: string;
  lineNumber: number;
  hasJSDoc: boolean;
}

interface FileDiff {
  filePath: string;
  hunks: Array<{
    content: string;
    newStart: number;
    newLines: number;
  }>;
}

export async function scanGitDiffTS(
  stagedOnly: boolean = false
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
    if (!fileDiff.filePath.match(/\.(ts|js|tsx|jsx)$/)) {
      continue;
    }

    try {
      const fileContent = fs.readFileSync(fileDiff.filePath, "utf-8");

      const sourceFile = ts.createSourceFile(
        fileDiff.filePath,
        fileContent,
        ts.ScriptTarget.Latest,
        true
      );

      for (const hunk of fileDiff.hunks) {
        const functions = findFunctionsInHunk(
          sourceFile,
          hunk.newStart,
          hunk.newStart + hunk.newLines
        );
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
  endLine: number
): DetectedFunction[] {
  const detected: DetectedFunction[] = [];

  function visit(node: ts.Node) {
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node)
    ) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(
        node.getStart()
      );
      const lineNumber = line + 1;

      if (lineNumber >= startLine && lineNumber <= endLine) {
        const jsDocs = ts.getJSDocTags(node);
        detected.push({
          name: getFunctionName(node),
          code: node.getFullText(sourceFile),
          filePath: sourceFile.fileName,
          lineNumber,
          hasJSDoc: jsDocs.length > 0,
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return detected;
}

function getFunctionName(node: ts.FunctionLikeDeclaration): string {
  if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
    return node.name?.getText() || "anonymous";
  }

  if (ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
    const parent = node.parent;
    if (ts.isVariableDeclaration(parent) && parent.name) {
      return parent.name.getText();
    }
  }

  return "anonymous";
}
