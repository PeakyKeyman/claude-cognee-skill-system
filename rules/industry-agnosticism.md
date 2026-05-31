# Industry-Agnosticism Rule for Agents (MANDATORY)

**Trigger:** Building or reviewing any agent, primitive, rule, profiler, or default that analyzes data.

When building agents that analyze data, **never assume a property of the data; always discover it**. Every threshold, coefficient, or default that shapes agent behavior must be either computed from measured properties of the actual input, derived from a formula with citations to non-domain sources (statistics textbooks, formal tests, peer-reviewed reference datasets), or produced by a constrained LLM decision that sees the full data context. Hardcoded domain heuristics are forbidden.

The failure mode this rule prevents: an agent that works beautifully on the developer's test case collapses silently on any dataset with a different shape, cadence, scale, or industry. The broken assumption doesn't surface as an error — it surfaces as confidently wrong output.

## Five operational tests

1. **Computable from data? Compute it.** If the input carries the answer (seasonal period, cadence, variance, peer distribution), read it from there. No hardcoded absolute. Example: write `n_min = 2 * seasonal_period`, not `n_min = 12`.
2. **Coefficients must cite non-domain sources.** Statistics literature, formal hypothesis tests, public reference datasets. "Rules of thumb," "industry conventions," and "everybody knows" are not citations. If you can't name the textbook or dataset, you're assuming.
3. **Discovered values flow through typed context fields.** The rule becomes a pure function of the context. Add the profiler field before adding the rule, never the reverse.
4. **Semantic judgment goes to the LLM with full context — never a hardcoded menu of acceptable answers.** The menu encodes assumptions too. Constrain via Pydantic schema (type + range + justification string), not enum literals.
5. **Fails-safe to skip, never to heuristic.** When a required context field is missing, the rule returns inert (pass/no-op), not "use this default." A silent default IS the assumption.

## Red flags during code review

- A bare integer or float threshold in a rule with no inline citation
- A parameter name that implies a cadence (`n_months`, `days_stale`)
- A default that assumes a scale (`min_revenue_millions`)
- An enum of "acceptable" values with no justification for membership
- A comment like "works for most companies" or "standard SMB practice"
- Any structural pattern that only makes sense for one industry (e.g. "gross margin is cost-of-goods / revenue" — fails for services with billable hours)

When you catch yourself typing a bare number, stop and ask: "what measurable property of the data should this be derived from?" If there's no answer, the rule probably shouldn't exist.

## When a bare coefficient IS acceptable

Only when it's (a) a property of a formal statistical test with a textbook citation, (b) a numerical tolerance for float equality, or (c) an infrastructure guard rail (timeout, size cap, retry count). In all three cases, the coefficient must appear with an inline comment naming the source.

Everything else goes through the discovery path.

## For agents that analyze domain-specific data

If your agent needs domain-specific reference ranges (e.g., "is this gross margin anomalous for this industry?"), build or load a **measured, sourced, cited peer distribution** rather than hardcoding ranges. Public sources that work: SEC EDGAR XBRL (per-company tagged financials), IRS SOI (aggregate by industry + asset bucket), NYU Stern Damodaran datasets (annual industry ratios), US Census Economic Census. The rule then computes z-scores against the loaded distribution — "anomalous" is a function of observed position relative to measured peers, not a coded concept.
