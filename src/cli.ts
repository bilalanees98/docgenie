#!/usr/bin/env node

import { config } from "dotenv";

// Load environment variables from .env file
config();

import { Command } from "commander";
// import { version } from "../package.json";
import { scanGitDiff } from "./git/diffScanner.js";
import { generateDocs } from "./ai/docGenerator.js";

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
      const newFunctions = await scanGitDiff(options.staged);
      if (newFunctions.length === 0) {
        console.log("No new functions found in the diff.");
        return;
      }

      console.log(
        `Found ${newFunctions.length} new functions. Generating documentation...`
      );
      const results = await generateDocs(newFunctions);
      console.log(results);
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
