#!/usr/bin/env node

// PreToolUse hook: File size guard for Write tool
// Matcher: Write
//
// Prevents Claude from writing excessively large single files (>500 lines).
// Large files should be split into smaller modules.
// Also warns on suspiciously large diffs when overwriting existing files.

let input = '';
const timeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(timeout);
  try {
    const data = JSON.parse(input);
    const toolInput = data.tool_input || {};
    const content = toolInput.content || '';
    const filePath = toolInput.file_path || '';

    // MEMORY.md size guard — Claude Code's MEMORY.md loader silently truncates
    // at ~24KB. Writes beyond that drop the bottom of the index, breaking
    // future-session continuity without any error signal. Block hard at 23KB
    // to leave a safety margin. Codified 2026-05-31 after a real silent
    // truncation incident on this user's MEMORY.md (63KB / 60% lost).
    if (filePath.endsWith('/MEMORY.md') && content.length > 23 * 1024) {
      const result = {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: `MEMORY.md is ${Math.round(content.length/1024)}KB. Claude Code's MEMORY.md loader truncates at ~24KB — writing past that silently drops content. Compress entries to one line each (≤140 chars), move detail to per-topic files, OR archive older entries before re-attempting.`
        }
      };
      process.stdout.write(JSON.stringify(result));
      process.exit(0);
    }

    const lineCount = content.split('\n').length;

    // Hard block at 800 lines
    if (lineCount > 800) {
      const result = {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: `File is ${lineCount} lines. Files over 800 lines should be split into smaller modules. Break this into focused, single-responsibility files.`
        }
      };
      process.stdout.write(JSON.stringify(result));
      process.exit(0);
    }

    // Soft warning at 500 lines (inject context, don't block)
    if (lineCount > 500) {
      const result = {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext: `NOTE: Writing a ${lineCount}-line file. Consider whether this should be split into smaller modules for maintainability.`
        }
      };
      process.stdout.write(JSON.stringify(result));
    }

  } catch (e) {
    // Fail open
  }
  process.exit(0);
});
