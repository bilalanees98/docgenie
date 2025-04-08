import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import chalk from "chalk";
import {
  FunctionInfo,
  isProcessableFile,
  isFunctionLike,
  createSourceFile,
  getFunctionInfo,
} from "../utils/tsUtils.js";

interface FileCoverage {
  filePath: string;
  totalFunctions: number;
  documentedFunctions: number;
  undocumentedFunctions: FunctionInfo[];
}

interface CoverageReport {
  totalFiles: number;
  totalFunctions: number;
  documentedFunctions: number;
  coverage: number;
  fileReports: FileCoverage[];
}

/**
 * Scans a TypeScript/JavaScript file for functions and their JSDoc coverage
 */
function scanFile(filePath: string): FileCoverage {
  const content = fs.readFileSync(filePath, "utf-8");
  const sourceFile = createSourceFile(filePath, content);

  const undocumentedFunctions: FunctionInfo[] = [];
  let totalFunctions = 0;
  let documentedFunctions = 0;

  function visit(node: ts.Node) {
    if (isFunctionLike(node)) {
      totalFunctions++;
      const functionInfo = getFunctionInfo(node, sourceFile);

      if (functionInfo.hasJSDoc) {
        documentedFunctions++;
      } else {
        undocumentedFunctions.push(functionInfo);
      }
    }
    node.forEachChild(visit);
  }

  visit(sourceFile);

  return {
    filePath,
    totalFunctions,
    documentedFunctions,
    undocumentedFunctions,
  };
}

/**
 * Generates a coverage report for all TypeScript/JavaScript files in the given directory
 */
export async function generateCoverageReport(
  targetPath: string = process.cwd(),
): Promise<CoverageReport> {
  const fileReports: FileCoverage[] = [];
  let totalFunctions = 0;
  let documentedFunctions = 0;

  function scanDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && isProcessableFile(fullPath)) {
        const coverage = scanFile(fullPath);
        fileReports.push(coverage);
        totalFunctions += coverage.totalFunctions;
        documentedFunctions += coverage.documentedFunctions;
      }
    }
  }

  // Check if targetPath is a file or directory
  const stats = fs.statSync(targetPath);

  if (stats.isFile()) {
    if (isProcessableFile(targetPath)) {
      const coverage = scanFile(targetPath);
      fileReports.push(coverage);
      totalFunctions = coverage.totalFunctions;
      documentedFunctions = coverage.documentedFunctions;
    }
  } else if (stats.isDirectory()) {
    scanDirectory(targetPath);
  } else {
    throw new Error(
      `Invalid path: ${targetPath} is neither a file nor a directory`,
    );
  }

  return {
    totalFiles: fileReports.length,
    totalFunctions,
    documentedFunctions,
    coverage:
      totalFunctions > 0 ? (documentedFunctions / totalFunctions) * 100 : 100,
    fileReports,
  };
}

/**
 * Prints a coverage report to the console
 */
export function printCoverageReport(report: CoverageReport): void {
  console.log(chalk.bold("\nJSDoc Coverage Report"));
  console.log("===================\n");

  // Print summary
  console.log(chalk.bold("Summary:"));
  console.log(`Files scanned: ${report.totalFiles}`);
  console.log(`Total functions: ${report.totalFunctions}`);
  console.log(`Documented functions: ${report.documentedFunctions}`);
  console.log(
    `Coverage: ${chalk.bold(report.coverage.toFixed(2))}%`,
    getCoverageColor(report.coverage),
  );

  // Print file details
  console.log(chalk.bold("\nFile Details:"));
  for (const file of report.fileReports) {
    if (file.totalFunctions === 0) continue;

    const fileCoverage = (file.documentedFunctions / file.totalFunctions) * 100;
    console.log(
      `\n${chalk.cyan(file.filePath)}:`,
      `${fileCoverage.toFixed(2)}%`,
      getCoverageColor(fileCoverage),
    );

    if (file.undocumentedFunctions.length > 0) {
      console.log(chalk.yellow("  Undocumented functions:"));
      for (const fn of file.undocumentedFunctions) {
        console.log(`    - ${fn.name} (line ${fn.lineNumber})`);
      }
    }
  }
}

/**
 * Gets the appropriate color for a coverage percentage
 */
function getCoverageColor(coverage: number): string {
  if (coverage >= 90) return chalk.green("✓");
  if (coverage >= 70) return chalk.yellow("!");
  return chalk.red("✗");
}
