# Configuration Single Source of Truth (MANDATORY)

**Trigger:** Writing, reviewing, or editing any configuration that controls runtime behavior — model selection, token budgets, temperatures, timeouts, routing, provider registration, sandbox limits, eval knobs, feature flags.

## Rule

Every configuration concept has exactly **one** source-of-truth file. Runtime scripts, eval runners, tests, and production orchestrators all **load** from that file — they do not re-declare the same values inline.

**Forbidden:** hardcoding a model name, token limit, temperature, or routing map in a script when an equivalent value exists (or should exist) in a config module. Examples of the anti-pattern:
- `PhaseRoutingConfig()` has defaults, AND `scripts/run_*.py` constructs its own `PhaseRoutingConfig(planner="...", narrator="...")` with different values.
- `DEFAULT_MAX_TOKENS = 8000` in one provider file, `max_tokens=16000` inline in another caller.
- Temperature = 0.0 in one place, 0.2 in another, neither cited to a config constant.

**Required:** one config module (e.g. `core/config/runtime.py` or equivalent) holding the canonical values, typed with Pydantic or a dataclass, with production defaults baked in. Every caller imports and optionally overrides via a single `overrides: dict | Path` mechanism.

## Why

- **Measurement-parity guarantee.** If eval scripts and production runtime declare routing separately, any "we scored 83% on the benchmark" claim is unfalsifiable — the measurement may have used different models than production will. This is a hard gate for any accuracy claim.
- **Drift surface elimination.** Every additional declaration site of the same value is a future source of silent divergence. One site = zero drift.
- **Debuggability.** When a regression shows up, "what changed in the config?" is answered by a single `git log` on one file, not a grep across the repo.

## How to apply

- When adding a new runtime knob: first locate (or create) the canonical config module; add the field there; all callers import from it.
- When touching a script that inlines a value that lives in config: stop and refactor — the script loads from config; do not perpetuate the duplicate.
- When `grep` shows the same model name / token number / temperature in more than one non-test file: file an issue or fix in the current PR. Two occurrences ≠ pattern; it's a leak.
- **Tests are the exception:** unit tests MAY construct config objects inline with fake/minimal values. Integration and eval tests must load the real config and apply explicit overrides.
- Production defaults must be the config's default values. A script that works by overriding every field is a smell — it means the defaults are wrong.

## Runtime assertion pattern

When a script must deviate (e.g. an eval runner comparing two presets), the deviation is explicit:

```python
from core.config.runtime import load_runtime_config

cfg = load_runtime_config(preset="production")       # canonical
cfg_alt = load_runtime_config(preset="experiment_x") # explicit override

# runtime asserts resolved values are what preset claims
assert cfg.routing.planner == EXPECTED_PRODUCTION_PLANNER
```

The preset name travels with the output artifact (`run_metadata.preset` / `run_metadata.routing`), so any future reader of the measurement can tell which config was used.

## Red flags during code review

- Same string literal (model name, provider name) in two or more non-test files.
- A script that constructs a config object from scratch instead of calling a loader.
- A default value that exists in the config module AND is passed explicitly at every call site (the explicit pass is dead code or, worse, drifts).
- A comment like "TODO: centralize this" that's older than one commit.
- Eval runners with hardcoded routing, token, or temperature values.

## Scope note

This rule is about **runtime-behavior config**, not build-time metadata (package version, author, license). Those live where the tooling requires them (pyproject.toml, etc.).
