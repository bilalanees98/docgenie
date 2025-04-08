#!/usr/bin/env node

import { config } from "dotenv";
import { Command } from "commander";
import { generateDocs } from "./ai/docGenerator.js";
import { scanGitDiffTS } from "./git/tsdiffScanner.js";
import { convertResultsToDiffs, presentDiffs } from "./cli/diffPresenter.js";
import {
  generateCoverageReport,
  printCoverageReport,
} from "./doc-coverage/coverageScanner.js";
import chalk from "chalk";
import * as path from "path";

// Load environment variables from .env file
config();

const program = new Command();

program
  .name("doc-genie")
  .description("AI-powered documentation enforcement tool")
  .version("0.1.0");

program
  .command("scan")
  .description("Scan git diff for new functions and generate JSDoc comments")
  .option("-s, --staged", "Only scan staged changes", false)
  .action(async (options) => {
    try {
      const newFunctions = await scanGitDiffTS(options.staged);

      if (newFunctions.length === 0) {
        console.log(chalk.yellow("No new functions found in the diff."));
        return;
      }

      console.log(
        chalk.cyan(
          `\nFound ${newFunctions.length} new functions. Generating documentation...\n`,
        ),
      );
      const results = await generateDocs(newFunctions);

      // Convert results to diffs and present them
      const diffs = convertResultsToDiffs(results);
      const modifiedFiles = await presentDiffs(diffs);

      if (modifiedFiles.length > 0) {
        console.log(
          chalk.green(
            `\nCompleted! Added documentation to ${modifiedFiles.length} files.`,
          ),
        );
      } else {
        console.log(chalk.yellow("\nNo changes were accepted."));
      }
    } catch (error) {
      console.error(
        chalk.red("Error:"),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  });

program
  .command("coverage")
  .description("Generate a JSDoc coverage report")
  .argument("[path]", "File or directory to analyze")
  .option("-d, --dir <directory>", "Directory to scan", process.cwd())
  .option("-f, --file <file>", "Specific file to scan")
  .option("-t, --threshold <number>", "Coverage threshold percentage", "70")
  .action(async (pathArg, options) => {
    try {
      let targetPath = pathArg || options.dir;

      // If a specific file is provided via --file, use that
      if (options.file) {
        targetPath = options.file;
      }

      // Resolve relative paths
      targetPath = path.resolve(process.cwd(), targetPath);

      console.log(
        chalk.cyan(`Generating JSDoc coverage report for: ${targetPath}`),
      );
      const report = await generateCoverageReport(targetPath);
      printCoverageReport(report);

      // Check against threshold
      const threshold = parseInt(options.threshold);
      if (report.coverage < threshold) {
        console.log(
          chalk.red(
            `\nCoverage (${report.coverage.toFixed(2)}%) is below the threshold (${threshold}%)`,
          ),
        );
        process.exit(1);
      }
    } catch (error) {
      console.error(
        chalk.red("Error:"),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  });

program.parse();
