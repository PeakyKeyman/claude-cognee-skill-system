#!/usr/bin/env node

// PreCompact hook: Save session state before context compaction
//
// Writes session-checkpoint.md in the project's memory directory.
// Includes: timestamp, git state, active TodoWrite items, and files touched.
// On session resume after compaction, session-init.js detects this file.
//
// Replaces: basic pre-compact-saver.js (now project-aware, richer state)

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const homeDir = os.homedir();
const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(homeDir, '.claude');
const cwd = process.cwd();

try {
  // Find project memory directory
  const projectsDir = path.join(claudeDir, 'projects');
  const projectKey = cwd.replace(/\//g, '-').replace(/\s+/g, '-');

  let memoryDir = null;

  if (fs.existsSync(projectsDir)) {
    const dirs = fs.readdirSync(projectsDir);
    const match = dirs.find(d => projectKey.startsWith(d) || d.startsWith(projectKey));
    if (match) {
      memoryDir = path.join(projectsDir, match, 'memory');
    }
  }

  // Fallback to generic memory dir
  if (!memoryDir) {
    memoryDir = path.join(claudeDir, 'memory');
  }

  if (!fs.existsSync(memoryDir)) {
    fs.mkdirSync(memoryDir, { recursive: true });
  }

  const checkpointFile = path.join(memoryDir, 'session-checkpoint.md');
  const timestamp = new Date().toISOString();

  // Gather git context
  let gitContext = '';
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD 2>/dev/null', { encoding: 'utf8', timeout: 3000 }).trim();
    const status = execSync('git status --porcelain 2>/dev/null', { encoding: 'utf8', timeout: 3000 }).trim();
    const recentCommits = execSync('git log --oneline -5 2>/dev/null', { encoding: 'utf8', timeout: 3000 }).trim();
    gitContext = [
      `**Branch:** ${branch}`,
      '',
      '**Uncommitted changes:**',
      status || '(clean)',
      '',
      '**Recent commits:**',
      recentCommits || '(none)',
    ].join('\n');
  } catch (e) {
    gitContext = '(not a git repo)';
  }

  // Gather active todos
  let todoContext = '';
  try {
    const input = JSON.parse(process.env.CLAUDE_HOOK_INPUT || '{}');
    const sessionId = input.session_id || '';
    if (sessionId) {
      const todosDir = path.join(claudeDir, 'todos');
      if (fs.existsSync(todosDir)) {
        const files = fs.readdirSync(todosDir)
          .filter(f => f.startsWith(sessionId) && f.endsWith('.json'))
          .map(f => ({ name: f, mtime: fs.statSync(path.join(todosDir, f)).mtime }))
          .sort((a, b) => b.mtime - a.mtime);

        if (files.length > 0) {
          const todos = JSON.parse(fs.readFileSync(path.join(todosDir, files[0].name), 'utf8'));
          todoContext = todos.map(t => {
            const icon = t.status === 'completed' ? '✅' : t.status === 'in_progress' ? '🔄' : '⬜';
            return `${icon} ${t.content}`;
          }).join('\n');
        }
      }
    }
  } catch (e) {
    todoContext = '(could not read todos)';
  }

  const content = [
    '# Session Checkpoint',
    `**Saved at:** ${timestamp}`,
    `**Working directory:** ${cwd}`,
    `**Reason:** Pre-compaction auto-save`,
    '',
    '## Git State',
    gitContext,
    '',
    '## Task Progress',
    todoContext || '(no todos found)',
    '',
    '## Recovery Instructions',
    'This file was auto-saved before context compaction.',
    'If resuming this work:',
    '1. Read this file to restore context',
    '2. Search Cognee for any lessons saved during this session',
    '3. Check git status for current state of changes',
    '4. Resume from the first incomplete task above',
    ''
  ].join('\n');

  fs.writeFileSync(checkpointFile, content);

  // Remind Claude to persist lessons to Cognee before compaction
  const result = {
    additionalContext: [
      'PRE-COMPACTION REMINDER: If you discovered non-trivial bugs, made architecture decisions, or learned important patterns during this session,',
      'use Cognee `save_interaction` NOW to persist them before context is lost.',
      'Session checkpoint saved to: ' + checkpointFile
    ].join(' ')
  };
  process.stdout.write(JSON.stringify(result));
} catch (e) {
  // Fail open
}

process.exit(0);
