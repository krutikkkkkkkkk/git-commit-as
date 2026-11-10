#!/usr/bin/env node
// Commit in this repo under a fixed author identity, without changing your git config.
//
// Usage:
//   node scripts/commit-as.mjs "commit message"            commit what is already staged
//   node scripts/commit-as.mjs "commit message" --all      stage everything first
//   node scripts/commit-as.mjs "commit message" --push     push after committing
//   node scripts/commit-as.mjs --empty --push              empty commit (re-trigger a deploy)

import { execFileSync } from "node:child_process";

// ---- Set these once per project -------------------------------------------
const AUTHOR_NAME = "His Name";
const AUTHOR_EMAIL = "email-verified-on-his-github-account@example.com";
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const message = args.find((a) => !a.startsWith("--"));

const git = (gitArgs, opts = {}) =>
  execFileSync("git", gitArgs, { encoding: "utf8", stdio: "pipe", ...opts });

function fail(text) {
  console.error(`commit-as: ${text}`);
  process.exit(1);
}

if (AUTHOR_EMAIL.endsWith("@example.com")) {
  fail("set AUTHOR_NAME and AUTHOR_EMAIL at the top of this script first.");
}

try {
  git(["rev-parse", "--is-inside-work-tree"]);
} catch {
  fail("not inside a git repository.");
}

const empty = flags.has("--empty");
if (!message && !empty) {
  fail('give a commit message, e.g. node scripts/commit-as.mjs "Fix header" --all --push');
}

if (flags.has("--all")) git(["add", "-A"]);

if (!empty) {
  let nothingStaged = true;
  try {
    git(["diff", "--cached", "--quiet"]); // exits 1 when something is staged
  } catch {
    nothingStaged = false;
  }
  if (nothingStaged) fail("nothing is staged. Stage files first, or pass --all.");
}

// -c applies the identity to this one command only, as both author and committer.
const commitArgs = [
  "-c", `user.name=${AUTHOR_NAME}`,
  "-c", `user.email=${AUTHOR_EMAIL}`,
  "commit",
  "-m", message || "Trigger deploy",
];
if (empty) commitArgs.push("--allow-empty");

try {
  git(commitArgs, { stdio: "inherit" });
} catch {
  fail("git commit failed (see output above).");
}

console.log(`Committed as: ${git(["log", "-1", "--format=%an <%ae>"]).trim()}`);

if (flags.has("--push")) {
  try {
    git(["push"], { stdio: "inherit" });
  } catch {
    fail("git push failed (see output above). The commit itself was made.");
  }
}
