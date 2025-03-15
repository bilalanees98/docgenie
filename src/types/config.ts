export interface DocGenieConfig {
  /**
   * OpenAI API key
   */
  openaiApiKey?: string;

  /**
   * The model to use for generating documentation
   * @default "gpt-4"
   */
  model?: string;

  /**
   * Temperature for the AI model
   * @default 0.7
   */
  temperature?: number;

  /**
   * Whether to only scan staged changes
   * @default false
   */
  stagedOnly?: boolean;

  /**
   * File patterns to ignore
   * @default ["node_modules/**", "dist/**"]
   */
  ignore?: string[];

  /**
   * File patterns to include
   * @default [".ts", ".js", ".tsx", ".jsx"]
   */
  include?: string[];
}
