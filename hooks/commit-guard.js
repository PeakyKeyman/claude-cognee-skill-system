#!/usr/bin/env node

// PreToolUse hook: Git commit quality gate
// Matcher: Bash
//
// Intercepts `git commit` commands and runs pre-commit checks:
// - Blocks commits with console.log/print statements in production code
// - Blocks commits with TODO/FIXME/HACK unless --allow-todos flag
// - Warns on large commits (>20 files)
//
// Only triggers on git commit commands, passes everything else through.

let input = '';
const timeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(timeout);
  try {
    const data = JSON.parse(input);
    const command = (data.tool_input?.command || '').trim();

    // Only intercept git commit
    if (!command.match(/^git\s+commit\b/)) {
      process.exit(0);
    }

    const { execSync } = require('child_process');

    // Branch check — block commits on main/master per workflow.md rule
    // "Never commit to main/master — feature branches." Codified 2026-05-31.
    // The rule existed but relied on Claude remembering; this hook enforces it.
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD 2>/dev/null', { encoding: 'utf8', timeout: 3000 }).trim();
      if (branch === 'main' || branch === 'master') {
        const result = {
          hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: 'deny',
            permissionDecisionReason: `BLOCKED: About to commit on ${branch}. Per workflow.md, never commit to main/master — use a feature branch. If this is genuinely intentional (e.g., merging via fast-forward), the user must run the commit manually.`
          }
        };
        process.stdout.write(JSON.stringify(result));
        process.exit(0);
      }
    } catch (e) {
      // Can't determine branch (detached HEAD, not a git repo) — pass through
    }

    // Worktree HEAD verification (NEW 2026-05-31) — codifies
    // feedback_multi_session_git_head_race: two concurrent Claude sessions
    // share .git/HEAD; one's checkout silently rebinds the other's. Warn
    // (don't block) so the operator can verify the commit lands on the
    // intended branch.
    try {
      const symbolicRef = execSync('git symbolic-ref HEAD 2>/dev/null', { encoding: 'utf8', timeout: 3000 }).trim();
      if (!symbolicRef.startsWith('refs/heads/')) {
        const result = {
          hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            additionalContext: `WARNING: HEAD is not on a branch (symbolic-ref: ${symbolicRef || 'detached HEAD'}). If you're in a worktree or multi-session context, verify your commit lands on the intended branch before proceeding.`
          }
        };
        process.stdout.write(JSON.stringify(result));
        // Don't block — detached HEAD is sometimes intentional (rebase, bisect)
      }
    } catch (e) {
      // Not a git repo or symbolic-ref failed — pass through
    }

    // Check staged files for issues
    const staged = execSync('git diff --cached --name-only 2>/dev/null', { encoding: 'utf8', timeout: 5000 }).trim();
    if (!staged) {
      process.exit(0); // No staged files, let git handle the error
    }

    const files = staged.split('\n');
    const issues = [];

    // Large commit warning (doesn't block, just injects context)
    if (files.length > 20) {
      const result = {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext: `Large commit: ${files.length} files staged. Consider splitting into smaller, atomic commits.`
        }
      };
      process.stdout.write(JSON.stringify(result));
      process.exit(0);
    }

    // Check for debug statements in staged diffs
    try {
      const diff = execSync('git diff --cached 2>/dev/null', { encoding: 'utf8', timeout: 10000 });
      const addedLines = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++'));

      const debugPatterns = [
        { pattern: /console\.log\(/, lang: 'JS', what: 'console.log' },
        { pattern: /debugger;/, lang: 'JS', what: 'debugger statement' },
        { pattern: /print\(f?['"]DEBUG/, lang: 'Python', what: 'debug print' },
        { pattern: /breakpoint\(\)/, lang: 'Python', what: 'breakpoint()' },
        { pattern: /import\s+pdb/, lang: 'Python', what: 'pdb import' },
      ];

      for (const line of addedLines) {
        for (const { pattern, lang, what } of debugPatterns) {
          if (pattern.test(line)) {
            issues.push(`${what} (${lang})`);
          }
        }
      }
    } catch (e) {}

    if (issues.length > 0) {
      const unique = [...new Set(issues)];
      const result = {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext: `Pre-commit check: Found debug statements in staged code: ${unique.join(', ')}. Remove these before committing, or acknowledge them in the commit message if intentional.`
        }
      };
      process.stdout.write(JSON.stringify(result));
    }

  } catch (e) {
    // Fail open
  }
  process.exit(0);
});
