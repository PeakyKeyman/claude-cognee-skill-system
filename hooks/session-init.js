#!/usr/bin/env node

// SessionStart hook: Project-aware context loader + MCP automation
// - Scans memory files in project-specific directories
// - Detects CodeGraph index status, prompts indexing if missing
// - Reminds to search Cognee for prior project decisions
// - Lists custom agents from ~/.claude/agents/
// - Reports git branch context
//
// Replaces: gsd-check-update.js + session-memory-loader.js

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const homeDir = os.homedir();
const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(homeDir, '.claude');
const cwd = process.cwd();

try {
  const context = [];
  const projectName = path.basename(cwd);

  // 0. Clean up ORPHAN cognee-mcp processes (parent Claude session is dead).
  //
  // CHANGED 2026-05-31. The old logic killed "all but highest PID" assuming
  // newest = current session. That assumption breaks with concurrent Claude
  // Code sessions: each session has its own cognee-mcp; "newest" belongs to
  // whichever session most recently restarted, NOT to the session currently
  // running long-lived work. Killing the "stale" ones SIGTERM'd MCP servers
  // attached to live dormant/cowork sessions, breaking long-running cognify
  // calls mid-HTTP (Cognee httpx hung on `receive_response_headers.started`
  // because the subprocess was dead before Ollama could reply). Diagnosed
  // 2026-05-31 during the Cognee Postgres-swap validation arc.
  //
  // Historical motivation (Kuzu file lock) no longer applies post-Neo4j swap,
  // but orphan cleanup is still valuable hygiene — a Claude Code that crashes
  // (-9 / SIGKILL) leaves its cognee-mcp re-parented to launchd (PPID=1).
  //
  // New logic: for each cognee-mcp, look up PPID and probe parent aliveness
  // with kill(ppid, 0). Only kill MCPs whose parent is genuinely dead.
  try {
    const psList = execSync("pgrep -f 'cognee-mcp' 2>/dev/null", { encoding: 'utf8', timeout: 3000 }).trim();
    if (psList) {
      const pids = psList.split('\n').map(p => parseInt(p.trim(), 10)).filter(p => !isNaN(p));
      const orphans = [];
      pids.forEach(pid => {
        let ppid;
        try {
          const ppidStr = execSync(`ps -o ppid= -p ${pid}`, { encoding: 'utf8', timeout: 1000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
          ppid = parseInt(ppidStr, 10);
        } catch (e) {
          // Process died mid-check, or ps failed — skip (do not kill)
          return;
        }
        if (isNaN(ppid)) return;
        if (ppid <= 1) {
          // Reparented to launchd (PID 1) → original parent died → orphan
          orphans.push(pid);
          return;
        }
        try {
          // signal 0 = existence check; throws ESRCH if process gone
          process.kill(ppid, 0);
          // Parent alive — this MCP is attached to a live session; leave it alone
        } catch (e) {
          if (e.code === 'ESRCH') orphans.push(pid);
          // EPERM (different uid) or other → treat as alive, do NOT kill
        }
      });
      orphans.forEach(pid => {
        try { process.kill(pid, 'SIGTERM'); } catch (e) {}
      });
      if (orphans.length > 0) {
        context.push(`Cognee: Killed ${orphans.length} orphan cognee-mcp process(es) (parent session dead).`);
      }
    }
  } catch (e) {
    // pgrep returns exit 1 if no matches — that's fine
  }

  // 0.5. Cognee healthcheck (NEW 2026-05-31) — fast liveness check.
  // Validates the full Cognee stack (Ollama, Docker, Neo4j, MCP venv, etc.)
  // in ~3 seconds. Codified after the 2026-05-26 silent-failure incident
  // where .env was switched to Neo4j but the python driver wasn't installed,
  // causing all save_interaction + cognify calls to silently fail at the
  // graph-write step. Surfaces broken stack at session start, not at first
  // failed call.
  try {
    const healthCheckPath = path.join(claudeDir, 'cognee-mcp', 'healthcheck.sh');
    if (fs.existsSync(healthCheckPath)) {
      try {
        execSync(`bash "${healthCheckPath}" >/dev/null 2>&1`, {
          timeout: 5000,
          stdio: ['ignore', 'pipe', 'pipe']
        });
        // Exit 0 = green; no message clutter
      } catch (e) {
        // Non-zero exit OR timeout — surface the issue but don't block
        context.push('Cognee: healthcheck failed — run `bash ~/.claude/cognee-mcp/healthcheck.sh` for diagnosis. search/save_interaction calls may fail silently until fixed.');
      }
    }
  } catch (e) {
    // No healthcheck script present; skip silently
  }

  // 1. Detect project and load memory files
  const projectsDir = path.join(claudeDir, 'projects');
  if (fs.existsSync(projectsDir)) {
    const projectKey = cwd.replace(/\//g, '-').replace(/\s+/g, '-');

    let projectDir = null;
    if (fs.existsSync(path.join(projectsDir, projectKey))) {
      projectDir = path.join(projectsDir, projectKey);
    } else {
      try {
        const dirs = fs.readdirSync(projectsDir);
        const match = dirs.find(d => projectKey.startsWith(d) || d.startsWith(projectKey));
        if (match) {
          projectDir = path.join(projectsDir, match);
        }
      } catch (e) {}
    }

    if (projectDir) {
      const memoryDir = path.join(projectDir, 'memory');
      if (fs.existsSync(memoryDir)) {
        const files = fs.readdirSync(memoryDir)
          .filter(f => f.endsWith('.md') && f !== 'MEMORY.md')
          .sort();

        if (files.length > 0) {
          context.push('Available memory files (read on-demand when relevant):');
          files.forEach(f => context.push(`  - ${f}`));
        }

        const checkpoint = path.join(memoryDir, 'session-checkpoint.md');
        if (fs.existsSync(checkpoint)) {
          const stat = fs.statSync(checkpoint);
          const ageMinutes = (Date.now() - stat.mtimeMs) / 60000;
          if (ageMinutes < 120) {
            context.push('');
            context.push('Recent session checkpoint detected (from last compaction). Read ~/.claude/projects/*/memory/session-checkpoint.md if resuming prior work.');
          }
        }
      }

      const knownIssues = path.join(projectDir, 'KNOWN_ISSUES.md');
      if (fs.existsSync(knownIssues)) {
        context.push('');
        context.push('KNOWN_ISSUES.md exists for this project. Read it before debugging.');
      }
    }
  }

  // 2. CodeGraph — detect index, prompt if missing, warn if stale
  context.push('');
  const codegraphDir = path.join(cwd, '.codegraph');
  if (fs.existsSync(codegraphDir)) {
    let staleness = '';
    try {
      const dbFile = path.join(codegraphDir, 'codegraph.db');
      if (fs.existsSync(dbFile)) {
        const hours = Math.round((Date.now() - fs.statSync(dbFile).mtimeMs) / 3600000);
        if (hours > 48) staleness = ` (last indexed ${hours}h ago — re-index with \`npx @colbymchenry/codegraph init\`)`;
      }
    } catch (e) {}
    context.push(`CodeGraph: Index found for ${projectName}${staleness}. USE CodeGraph tools (symbol_search, get_callers, get_callees, impact_analysis) BEFORE manually reading code files.`);
  } else {
    context.push(`CodeGraph: NO INDEX for ${projectName}. Run \`npx @colbymchenry/codegraph init\` to create one. Without it, code navigation falls back to slow grep/read.`);
  }

  // 3. Cognee — remind to query cross-session memory
  context.push(`Cognee: Search for prior decisions and lessons about "${projectName}" BEFORE planning or debugging. Use \`save_interaction\` to persist findings before session ends.`);

  // 4. Custom agents — list what's available in ~/.claude/agents/
  const agentsDir = path.join(claudeDir, 'agents');
  if (fs.existsSync(agentsDir)) {
    try {
      const agents = fs.readdirSync(agentsDir)
        .filter(f => f.endsWith('.md'))
        .map(f => f.replace('.md', ''));
      if (agents.length > 0) {
        context.push('');
        context.push(`Custom agents: ${agents.join(', ')}`);
        context.push('Read ~/.claude/agents/<name>.md before starting complex tasks.');
      }
    } catch (e) {}
  }

  // 5. Git branch context
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD 2>/dev/null', { encoding: 'utf8', timeout: 3000 }).trim();
    if (branch) {
      const status = execSync('git status --porcelain 2>/dev/null', { encoding: 'utf8', timeout: 3000 }).trim();
      const dirty = status ? ` (${status.split('\n').length} uncommitted changes)` : ' (clean)';
      context.push('');
      context.push(`Git: ${branch}${dirty}`);
    }
  } catch (e) {}

  if (context.length > 0) {
    process.stdout.write(JSON.stringify({ additionalContext: context.join('\n') }));
  }
} catch (e) {
  // Fail open — never block session start
}

process.exit(0);
