#!/usr/bin/env node

// PreToolUse hook: Read guard — prevent context waste on large files
// Matcher: Read
//
// When Claude tries to read a large file (>300 lines), injects context
// nudging it to use CodeGraph for targeted navigation instead.
// Does NOT block — just makes Claude aware of the cost.
//
// Also detects when Claude reads a file that CodeGraph could answer
// (e.g., reading an entire module just to find a function definition).

const fs = require('fs');

let input = '';
const timeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(timeout);
  try {
    const data = JSON.parse(input);
    const toolInput = data.tool_input || {};
    const filePath = toolInput.file_path || '';

    if (!filePath) {
      process.exit(0);
    }

    // Check if file exists and get line count
    if (!fs.existsSync(filePath)) {
      process.exit(0);
    }

    const stat = fs.statSync(filePath);

    // Skip non-code files (images, binaries, etc.)
    if (stat.size > 5 * 1024 * 1024) {
      const result = {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext: `WARNING: File is ${Math.round(stat.size / 1024 / 1024)}MB. Reading large binary/data files wastes context. Consider using Bash (head, wc, file) to inspect it first.`
        }
      };
      process.stdout.write(JSON.stringify(result));
      process.exit(0);
    }

    // Only check text/code files
    const codeExts = new Set(['py', 'js', 'jsx', 'ts', 'tsx', 'go', 'rs', 'java', 'rb', 'cpp', 'c', 'h', 'hpp', 'cs', 'swift', 'kt', 'scala', 'vue', 'svelte']);
    const ext = filePath.split('.').pop().toLowerCase();
    const isCode = codeExts.has(ext);

    // Count lines for text files
    let lineCount = 0;
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      lineCount = content.split('\n').length;
    } catch (e) {
      process.exit(0);
    }

    // Check if user specified offset/limit (targeted read — don't warn)
    if (toolInput.offset || toolInput.limit) {
      process.exit(0);
    }

    // Large code file: nudge toward CodeGraph
    if (isCode && lineCount > 300) {
      const result = {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext: `This file is ${lineCount} lines. Before reading the full file, consider: ` +
            `(1) Use CodeGraph symbol_search to find the specific function/class you need, ` +
            `(2) Use CodeGraph get_callers/get_callees to trace relationships, ` +
            `(3) Use Read with offset+limit to read only the relevant section. ` +
            `Full file reads of large code files burn context fast.`
        }
      };
      process.stdout.write(JSON.stringify(result));
    }
    // Large non-code file: general warning
    else if (!isCode && lineCount > 500) {
      const result = {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext: `This file is ${lineCount} lines. Consider using Read with offset+limit or Grep to target specific content instead of reading the entire file.`
        }
      };
      process.stdout.write(JSON.stringify(result));
    }

  } catch (e) {
    // Fail open
  }
  process.exit(0);
});
