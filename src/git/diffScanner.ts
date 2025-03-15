import simpleGit from "simple-git";
import * as parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/types";
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

export async function scanGitDiff(
  stagedOnly: boolean = false
): Promise<DetectedFunction[]> {
  // Get the current working directory
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
    console.log("fileDiff", fileDiff);
    // Only process TypeScript/JavaScript files
    if (!fileDiff.filePath.match(/\.(ts|js|tsx|jsx)$/)) {
      continue;
    }

    try {
      const fileContent = fs.readFileSync(fileDiff.filePath, "utf-8");

      const ast = parser.parse(fileContent, {
        sourceType: "module",
        ecmaVersion: 2020,
        range: true,
        loc: true,
        tokens: true,
        comment: true,
        errorOnUnknownASTType: false,
      });

      for (const hunk of fileDiff.hunks) {
        const functions = findFunctionsInHunk(
          ast,
          hunk.newStart,
          hunk.newStart + hunk.newLines,
          fileContent
        );
        console.log("functions", functions);
        detectedFunctions.push(
          ...functions.map((fn) => ({
            name: getFunctionName(fn),
            code: fileContent.slice(
              (fn as TSESTree.Node).range![0],
              (fn as TSESTree.Node).range![1]
            ),
            filePath: fileDiff.filePath,
            lineNumber: getLineNumber(
              fileContent,
              (fn as TSESTree.Node).range![0]
            ),
            hasJSDoc: hasJSDoc(fn),
          }))
        );
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

    // New file
    if (line.startsWith("diff --git")) {
      if (currentFile) {
        files.push(currentFile);
      }
      const filePath = line.split(" b/")[1];
      currentFile = { filePath, hunks: [] };
      continue;
    }

    // Hunk header
    if (line.startsWith("@@")) {
      const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
      if (match && currentFile) {
        const newStart = parseInt(match[1]);
        const newLines = parseInt(match[2] || "1");
        let content = "";

        // Collect hunk content
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
  ast: any,
  startLine: number,
  endLine: number,
  fileContent: string
): Array<
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression
> {
  const functions: Array<
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.ArrowFunctionExpression
  > = [];

  function visit(node: any) {
    if (isFunctionNode(node)) {
      const nodeLine = getLineNumber(
        fileContent,
        (node as TSESTree.Node).range![0]
      );
      if (nodeLine >= startLine && nodeLine <= endLine) {
        functions.push(node);
      }
    }

    for (const key in node) {
      const child = node[key];
      if (child && typeof child === "object") {
        visit(child);
      }
    }
  }

  visit(ast);
  return functions;
}

function getFunctionName(
  node:
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.ArrowFunctionExpression
): string {
  if (node.type === AST_NODE_TYPES.FunctionDeclaration && node.id) {
    return node.id.name;
  }

  // For function expressions or arrow functions, try to get the variable name
  if (node.parent && "id" in node.parent) {
    return (node.parent as any).id?.name || "anonymous";
  }

  return "anonymous";
}

function getLineNumber(content: string, position: number): number {
  return content.slice(0, position).split("\n").length;
}

function isFunctionNode(
  node: any
): node is
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression {
  return (
    node.type === AST_NODE_TYPES.FunctionDeclaration ||
    node.type === AST_NODE_TYPES.FunctionExpression ||
    node.type === AST_NODE_TYPES.ArrowFunctionExpression
  );
}

function hasJSDoc(node: any): boolean {
  return (
    node.comments?.some(
      (comment: any) =>
        comment.type === "Block" && comment.value.startsWith("*")
    ) ?? false
  );
}
