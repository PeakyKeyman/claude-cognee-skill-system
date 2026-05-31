#!/usr/bin/env node

// PostToolUse hook: Test reminder + CodeGraph impact nudge after code edits
// Matcher: Edit|Write
//
// After editing/writing code files:
// 1. Tracks edited files in a session temp file
// 2. After 3+ code file edits, nudges to run tests
// 3. For significant changes, nudges to check CodeGraph for callers (blast radius)
//
// Does NOT block — injects additionalContext only.

const fs = require('fs');
const path = require('path');
const os = require('os');

let input = '';
const timeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(timeout);
  try {
    const data = JSON.parse(input);
    const sessionId = data.session_id || '';
    const toolInput = data.tool_input || {};
    const filePath = toolInput.file_path || '';

    if (!filePath || !sessionId) {
      process.exit(0);
    }

    // Only care about code files
    const codeExts = new Set(['py', 'js', 'jsx', 'ts', 'tsx', 'go', 'rs', 'java', 'rb', 'cpp', 'c', 'h', 'hpp', 'cs', 'swift', 'kt']);
    const ext = filePath.split('.').pop().toLowerCase();
    if (!codeExts.has(ext)) {
      process.exit(0);
    }

    // Skip test files — editing tests doesn't need a "run tests" reminder
    const basename = path.basename(filePath).toLowerCase();
    if (basename.startsWith('test_') || basename.endsWith('_test.' + ext) || basename.endsWith('.test.' + ext) || basename.endsWith('.spec.' + ext) || filePath.includes('/tests/') || filePath.includes('/__tests__/')) {
      process.exit(0);
    }

    // Track edited files in temp
    const trackPath = path.join(os.tmpdir(), `claude-edits-${sessionId}.json`);
    let tracked = { files: [], lastReminder: 0, editCount: 0 };

    if (fs.existsSync(trackPath)) {
      try { tracked = JSON.parse(fs.readFileSync(trackPath, 'utf8')); } catch (e) {}
    }

    // Add this file if not already tracked
    if (!tracked.files.includes(filePath)) {
      tracked.files.push(filePath);
    }
    tracked.editCount = (tracked.editCount || 0) + 1;

    const editsSinceReminder = tracked.editCount - tracked.lastReminder;

    // Nudge every 5 code edits
    if (editsSinceReminder >= 5) {
      tracked.lastReminder = tracked.editCount;
      fs.writeFileSync(trackPath, JSON.stringify(tracked));

      const fileList = tracked.files.slice(-5).map(f => path.basename(f)).join(', ');
      const messages = [];
      messages.push(`You've made ${tracked.editCount} code edits this session (recent: ${fileList}).`);
      messages.push('Run relevant tests now to catch regressions early — don\'t accumulate untested changes.');
      messages.push('Also consider: use CodeGraph get_callers on modified functions to check blast radius.');

      const result = {
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          additionalContext: messages.join(' ')
        }
      };
      process.stdout.write(JSON.stringify(result));
    } else {
      fs.writeFileSync(trackPath, JSON.stringify(tracked));
    }

  } catch (e) {
    // Fail open
  }
  process.exit(0);
});
