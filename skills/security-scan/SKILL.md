---
name: security-scan
description: "Scan 4 attack surfaces: prompt injection, credentials, data isolation, agent autonomy."
triggers:
  - "security"
  - "vulnerability"
  - "deploy"
  - "security scan"
---

# Security Scan Skill

## 4 Attack Surfaces

### 1. Prompt Injection
- System prompt content leaking to users
- User input inserted into prompts without sanitization
- Tool results containing instructions executed as trusted
- Indirect injection via document/email content

### 2. Credentials
- Hardcoded API keys, passwords, tokens
- Connection strings in code or logs
- .env files committed to git
- Secrets in error messages or stack traces

### 3. Data Isolation
- Tenant data leaking between users
- PII in logs, error messages, or analytics
- Shared caches without tenant scoping
- Database queries without tenant filters

### 4. Agent Autonomy
- Unbounded tool use (no rate limits, no confirmation for destructive actions)
- Missing human-in-the-loop for high-impact operations
- Tool results trusted without validation
- Agents executing arbitrary code from user input

## Output
```markdown
# Security Scan: [Target]
## Findings
| # | Surface | Severity | Finding | Location | Fix |
|---|---------|----------|---------|----------|-----|
| 1 | [Surface] | CRITICAL/HIGH/MEDIUM/LOW | [Issue] | [File:Line] | [Recommendation] |
## Summary: [PASS / X findings to address]
```
