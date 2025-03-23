import * as ts from "typescript";
import * as path from "path";

export interface FunctionInfo {
  name: string;
  filePath: string;
  lineNumber: number;
  hasJSDoc: boolean;
  code?: string;
}

/**
 * Checks if a file is a TypeScript/JavaScript file that should be processed
 */
export function isProcessableFile(filePath: string): boolean {
  const ext = path.extname(filePath);
  return (
    /\.(ts|js|tsx|jsx)$/.test(ext) &&
    !filePath.endsWith(".d.ts") &&
    !filePath.includes("node_modules")
  );
}

/**
 * Gets the name of a function-like declaration
 */
export function getFunctionName(node: ts.FunctionLikeDeclaration): string {
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

/**
 * Checks if a node is a function-like declaration
 */
export function isFunctionLike(
  node: ts.Node
): node is ts.FunctionLikeDeclaration {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node)
  );
}

/**
 * Creates a TypeScript source file from content
 */
export function createSourceFile(
  filePath: string,
  content: string
): ts.SourceFile {
  return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
}

/**
 * Gets basic information about a function node
 */
export function getFunctionInfo(
  node: ts.FunctionLikeDeclaration,
  sourceFile: ts.SourceFile,
  includeCode: boolean = false
): FunctionInfo {
  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  const jsDocs = ts.getJSDocTags(node);

  return {
    name: getFunctionName(node),
    filePath: sourceFile.fileName,
    lineNumber: line + 1,
    hasJSDoc: jsDocs.length > 0,
    ...(includeCode && { code: node.getFullText(sourceFile) }),
  };
}
