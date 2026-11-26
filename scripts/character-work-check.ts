/**
 * The `character work` CI check: a pull request whose title starts with
 * `char:` may change only files in `static/characters/` (ADR 0013).
 *
 * Usage, as `.github/workflows/character-work.yml` runs it:
 *   PR_TITLE=<title> BASE_SHA=<base sha> HEAD_SHA=<head sha> node scripts/character-work-check.ts
 * It exits 1 when the check fails and 0 when it passes.
 */
import { execFileSync } from "node:child_process";

export interface CharacterWorkInput {
  title: string;
  changedPaths: string[];
}

export interface CharacterWorkResult {
  pass: boolean;
  message: string;
}

/** Exact and lowercase, so `Char:` or ` char:` is not a second spelling to learn (design D-a). */
export const CHARACTER_WORK_MARK = "char:";

/** With its trailing slash, so `static/characters-old/` is outside. */
export const CHARACTER_FOLDER = "static/characters/";

export function judgeCharacterWork({
  title,
  changedPaths,
}: CharacterWorkInput): CharacterWorkResult {
  if (!title.startsWith(CHARACTER_WORK_MARK)) {
    return {
      pass: true,
      message: `This pull request is not marked as character work: its title does not start with "${CHARACTER_WORK_MARK}". Nothing to check.`,
    };
  }
  const outside = changedPaths.filter(
    (path) => !path.startsWith(CHARACTER_FOLDER),
  );
  if (outside.length > 0) {
    return {
      pass: false,
      message: [
        `This character work pull request changes files outside ${CHARACTER_FOLDER}:`,
        ...outside.map((path) => `  ${path}`),
        "",
        "To fix it, do one of these:",
        "- Move those changes to their own issue and pull request.",
        `- Remove the \`${CHARACTER_WORK_MARK}\` mark from the title if this pull request is not character work.`,
      ].join("\n"),
    };
  }
  return {
    pass: true,
    message: `This character work pull request changes only files in ${CHARACTER_FOLDER}.`,
  };
}

/**
 * The paths the pull request itself adds, changes or deletes. Three dots diff
 * from the merge base, so a stacked pull request is judged on its own commits;
 * `--no-renames` reports both sides of a rename; `-z` stops git quoting odd
 * names, and ends every path with NUL, which leaves empty strings to drop.
 */
function changedPathsBetween(baseSha: string, headSha: string): string[] {
  const output = execFileSync(
    "git",
    ["diff", "--name-only", "--no-renames", "-z", `${baseSha}...${headSha}`],
    { encoding: "utf8" },
  );
  return output.split("\0").filter((path) => path !== "");
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    console.error(
      `::error::${name} is not set. Set PR_TITLE, BASE_SHA and HEAD_SHA.`,
    );
    process.exit(1);
  }
  return value;
}

if (import.meta.main) {
  const title = process.env.PR_TITLE ?? "";
  const result = judgeCharacterWork({
    title,
    changedPaths: changedPathsBetween(
      requireEnv("BASE_SHA"),
      requireEnv("HEAD_SHA"),
    ),
  });
  if (result.pass) {
    console.log(result.message);
  } else {
    // An annotation holds one line; the paths and the fixes follow in the log.
    const [summary, ...rest] = result.message.split("\n");
    console.log(`::error::${summary}`);
    console.log(rest.join("\n"));
    process.exit(1);
  }
}
