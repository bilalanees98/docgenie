module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-line-length": [0, "always"], // Disable body line length restriction
    // Alternatively, you can set a much higher limit:
    // 'body-max-line-length': [2, 'always', 500],
  },
  // Ignore certain commit messages like those from semantic-release
  ignores: [
    (commit) =>
      commit.includes("chore(release)") || commit.includes("[skip ci]"),
  ],
};
