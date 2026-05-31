#!/usr/bin/env node

// PostToolUse hook: Multi-language auto-formatter
// Matcher: Edit|Write
//
// Auto-formats files after edit/write operations.
// Supports: Python (ruff), JS/TS (prettier), CSS/SCSS/HTML/YAML (prettier)
// Graceful failure — no-op if formatters aren't installed.

const { execSync } = require('child_process');

let input = '';
const timeout = setTimeout(() => process.exit(0), 5000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(timeout);
  try {
    const data = JSON.parse(input);
    const filePath = data.tool_input?.file_path || data.tool_response?.filePath || '';

    if (!filePath) {
      process.exit(0);
    }

    const ext = filePath.split('.').pop().toLowerCase();

    const formatters = {
      py: () => execSync(`ruff format "${filePath}" 2>/dev/null`, { timeout: 10000, stdio: 'ignore' }),
      js: () => execSync(`prettier --write "${filePath}" 2>/dev/null`, { timeout: 10000, stdio: 'ignore' }),
      jsx: () => execSync(`prettier --write "${filePath}" 2>/dev/null`, { timeout: 10000, stdio: 'ignore' }),
      ts: () => execSync(`prettier --write "${filePath}" 2>/dev/null`, { timeout: 10000, stdio: 'ignore' }),
      tsx: () => execSync(`prettier --write "${filePath}" 2>/dev/null`, { timeout: 10000, stdio: 'ignore' }),
      css: () => execSync(`prettier --write "${filePath}" 2>/dev/null`, { timeout: 10000, stdio: 'ignore' }),
      scss: () => execSync(`prettier --write "${filePath}" 2>/dev/null`, { timeout: 10000, stdio: 'ignore' }),
      html: () => execSync(`prettier --write "${filePath}" 2>/dev/null`, { timeout: 10000, stdio: 'ignore' }),
      yml: () => execSync(`prettier --write "${filePath}" 2>/dev/null`, { timeout: 10000, stdio: 'ignore' }),
      yaml: () => execSync(`prettier --write "${filePath}" 2>/dev/null`, { timeout: 10000, stdio: 'ignore' }),
    };

    const formatter = formatters[ext];
    if (formatter) {
      try { formatter(); } catch (e) {}
    }
  } catch (e) {}
  process.exit(0);
});
