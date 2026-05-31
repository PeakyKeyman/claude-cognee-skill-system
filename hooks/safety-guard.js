#!/usr/bin/env node

// PreToolUse hook: Safety guard for Bash commands
// Matcher: Bash
//
// Combines:
// 1. Dangerous command blocker (rm -rf /, force push main, DROP DATABASE, etc.)
// 2. Metronome guard (detects "efficiency" language indicating shortcuts)
// 3. Secret leak prevention (blocks commands that would echo/cat secrets)
//
// Exit 0 = allow, stdout JSON with deny = block

const os = require('os');

let input = '';
const timeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(timeout);
  try {
    const data = JSON.parse(input);
    const toolInput = data.tool_input || {};
    const command = (toolInput.command || '').trim();
    const description = (toolInput.description || '').trim();
    const fullText = `${description} ${command}`;

    // === 1. DANGEROUS COMMAND BLOCKING ===
    const dangerous = [
      { pattern: /rm\s+-rf\s+[\/~](?!\S)/, reason: 'Recursive delete of root/home' },
      { pattern: /rm\s+-rf\s+\.\s*$/, reason: 'Recursive delete of current directory' },
      { pattern: /git\s+push\s+--force\s+(origin\s+)?(main|master)\b/, reason: 'Force push to main/master' },
      { pattern: /git\s+reset\s+--hard(?!\s+HEAD~?\d)/, reason: 'Hard reset (potential data loss)' },
      { pattern: /git\s+clean\s+-[a-z]*f[a-z]*d/i, reason: 'Git clean -fd (removes untracked files and directories)' },
      { pattern: /DROP\s+(DATABASE|TABLE|SCHEMA)\b/i, reason: 'SQL destructive operation' },
      { pattern: /TRUNCATE\s+TABLE\b/i, reason: 'SQL truncate' },
      { pattern: /:(){ :\|:& };:/, reason: 'Fork bomb' },
      { pattern: /mkfs\./i, reason: 'Format filesystem' },
      { pattern: /dd\s+if=.*of=\/dev\//i, reason: 'Direct disk write' },
      { pattern: />\s*\/dev\/sd[a-z]/i, reason: 'Direct disk write' },
      { pattern: /chmod\s+-R\s+777\s+\//, reason: 'Recursive chmod 777 on root' },
      { pattern: /curl\s+.*\|\s*(ba)?sh/i, reason: 'Pipe remote script to shell' },
      { pattern: /wget\s+.*\|\s*(ba)?sh/i, reason: 'Pipe remote script to shell' },
      // Prod deploy guard (NEW 2026-05-31) — codifies CLAUDE.md "NEVER deploy
      // to prod without per-action permission". Production project name is one
      // typo from staging; this catches the typo.
      { pattern: /firebase\s+deploy\s+(?:.*\s+)?--project\s+(?:nua-labs-agentic-assist|production|prod)\b/i, reason: 'Production Firebase deploy — requires explicit user authorization per CLAUDE.md "NEVER deploy to prod without per-action permission". Ask the user to confirm and run manually.' },
      // Skip-hook block (NEW 2026-05-31) — codifies sub-agents.md "Never skip
      // hooks (--no-verify, --no-gpg-sign) unless the user explicitly requests it"
      { pattern: /git\s+(commit|push|merge|rebase)\s+(?:.*\s+)?--no-verify\b/i, reason: 'Skipping hooks via --no-verify is forbidden unless explicitly requested. If a hook fails, fix the underlying issue.' },
      { pattern: /git\s+commit\s+(?:.*\s+)?--no-gpg-sign\b/i, reason: 'Bypassing GPG signing is forbidden unless explicitly requested.' },
    ];

    for (const { pattern, reason } of dangerous) {
      if (pattern.test(command)) {
        const result = {
          hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: 'deny',
            permissionDecisionReason: `BLOCKED: ${reason}. This command is too dangerous to run automatically. If you need this, ask the user to run it manually.`
          }
        };
        process.stdout.write(JSON.stringify(result));
        process.exit(0);
      }
    }

    // === 2. SECRET LEAK PREVENTION ===
    const secretPatterns = [
      /\b(API_KEY|SECRET_KEY|PRIVATE_KEY|PASSWORD|TOKEN|CREDENTIALS)\b.*=\s*['"]/i,
      /echo\s+.*\$(API_KEY|SECRET|PASSWORD|TOKEN)/i,
      /cat\s+.*\.(env|pem|key|secret)/i,
      /curl\s+.*(-H|--header)\s+['"]Authorization:/i,
    ];

    for (const pattern of secretPatterns) {
      if (pattern.test(command)) {
        const result = {
          hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: 'deny',
            permissionDecisionReason: 'BLOCKED: Command appears to expose secrets or credentials. Use environment variables or a secrets manager instead.'
          }
        };
        process.stdout.write(JSON.stringify(result));
        process.exit(0);
      }
    }

    // === 3. METRONOME GUARD (efficiency language detection) ===
    const efficiencyPatterns = [
      /\befficien/i,
      /\bquickly handle\b/i,
      /\bbatch process\b/i,
      /\bjust quickly\b/i,
      /\brapidly\b/i,
      /\bstreamline\b/i,
      /\blet me just\b.*\ball at once\b/i,
      /\bknock.*out\b.*\bat once\b/i,
      /\bdo.*all.*in one go\b/i,
    ];

    for (const pattern of efficiencyPatterns) {
      if (pattern.test(fullText)) {
        const result = {
          hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: 'deny',
            permissionDecisionReason: 'Metronome check: detected efficiency language. Slow down — are you taking a shortcut? Consider if this is the careful, methodical approach.'
          }
        };
        process.stdout.write(JSON.stringify(result));
        process.exit(0);
      }
    }

  } catch (e) {
    // Fail open
  }
  process.exit(0);
});
