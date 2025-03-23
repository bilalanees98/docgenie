#!/usr/bin/env node

import { config } from "dotenv";
import { Command } from "commander";
import { generateDocs } from "./ai/docGenerator.js";
import { scanGitDiffTS } from "./git/tsdiffScanner.js";
import { convertResultsToDiffs, presentDiffs } from "./cli/diffPresenter.js";
import chalk from "chalk";

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
          `\nFound ${newFunctions.length} new functions. Generating documentation...\n`
        )
      );
      const results = await generateDocs(newFunctions);

      // Convert results to diffs and present them
      const diffs = convertResultsToDiffs(results);
      const modifiedFiles = await presentDiffs(diffs);

      if (modifiedFiles.length > 0) {
        console.log(
          chalk.green(
            `\nCompleted! Added documentation to ${modifiedFiles.length} files.`
          )
        );
      } else {
        console.log(chalk.yellow("\nNo changes were accepted."));
      }
    } catch (error) {
      console.error(
        chalk.red("Error:"),
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

program.parse();
