#!/usr/bin/env node

// Stop hook: Cognee auto-save + strong reminder + session cleanup
//
// Two-layer Cognee persistence:
// 1. AUTO-SAVE: Calls cognee-auto-save.py to save session summary to knowledge graph
//    (files changed, topics, basic context — no Claude involvement needed)
// 2. STRONG REMINDER: Tells Claude to use `save_interaction` for deeper context
//    (architecture decisions, lessons learned, patterns — needs Claude's judgment)
//
// Also cleans up temp tracking files (edit tracker, context bridge).

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');

let input = '';
const timeout = setTimeout(() => process.exit(0), 5000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(timeout);
  try {
    const data = JSON.parse(input);
    const sessionId = data.session_id || '';

    const messages = [];
    let tracked = null;

    // Check if significant work was done (edits tracked)
    if (sessionId) {
      const trackPath = path.join(os.tmpdir(), `claude-edits-${sessionId}.json`);
      if (fs.existsSync(trackPath)) {
        try {
          tracked = JSON.parse(fs.readFileSync(trackPath, 'utf8'));
        } catch (e) {}
      }

      // Layer 1: AUTO-SAVE to Cognee (fire-and-forget, non-blocking)
      if (tracked && tracked.editCount && tracked.editCount >= 2) {
        const autoSavePath = path.join(os.homedir(), '.claude', 'hooks', 'cognee-auto-save.py');
        const sessionSummary = JSON.stringify({
          ...tracked,
          timestamp: new Date().toISOString(),
          projectDir: data.cwd || process.cwd(),
          sessionId: sessionId,
        });

        // Fire and forget — don't block session end
        try {
          execFile('python3', [autoSavePath, sessionSummary], {
            timeout: 20000,
            env: { ...process.env },
          }, (err) => {
            if (err) {
              // Log but don't block
              process.stderr.write(`Cognee auto-save: ${err.message}\n`);
            }
          });
        } catch (e) {
          // Fail open
        }
      }

      // Layer 2: STRONG REMINDER for Claude to save deeper context
      if (tracked && tracked.editCount && tracked.editCount >= 3) {
        messages.push(
          `MANDATORY SESSION END CHECKLIST (${tracked.editCount} edits across ${tracked.files.length} files):`
        );
        messages.push(
          '1. COGNEE SAVE: You MUST call mcp__cognee__save_interaction with a summary of: ' +
          '(a) architecture decisions made, (b) bugs found and their root causes, ' +
          '(c) patterns discovered, (d) key context that would help future sessions. ' +
          'The auto-save only captures file-level metadata — YOU must capture the reasoning.'
        );
        messages.push(
          '2. KNOWN_ISSUES.md: If bugs were resolved, append them.'
        );
        messages.push(
          '3. Memory: Update project memory files if project state changed significantly.'
        );
      } else if (tracked && tracked.editCount && tracked.editCount >= 1) {
        // Lighter reminder for small sessions
        messages.push(
          'Session end: If you made any architecture decisions or discovered patterns, ' +
          'call mcp__cognee__save_interaction before context is lost.'
        );
      }

      // Clean up tracking files
      if (tracked) {
        try { fs.unlinkSync(path.join(os.tmpdir(), `claude-edits-${sessionId}.json`)); } catch (e) {}
      }
      try {
        const ctxPath = path.join(os.tmpdir(), `claude-ctx-${sessionId}.json`);
        if (fs.existsSync(ctxPath)) fs.unlinkSync(ctxPath);
      } catch (e) {}
      try {
        const warnPath = path.join(os.tmpdir(), `claude-ctx-${sessionId}-warned.json`);
        if (fs.existsSync(warnPath)) fs.unlinkSync(warnPath);
      } catch (e) {}
    }

    if (messages.length > 0) {
      process.stdout.write(JSON.stringify({
        additionalContext: messages.join(' ')
      }));
    }

  } catch (e) {
    // Fail open
  }
  process.exit(0);
});
