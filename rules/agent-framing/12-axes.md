# 12 Axes — Canonical Dimensions for Agent Scope

The canonical list. Every agent design must consider where it stands on each, where the SOTA stands, and where the median human employee in the target role stands.

## Systems-engineering axes (how it's built and run)

1. **Architectural** — planning, execution, synthesis, verification, reflection, memory, state, routing, multi-agent, error recovery, concurrency, streaming, world model of cross-system causality

2. **Capability surface** — tool breadth, tool depth, modality, domain breadth, document handling, data sources, workplace artifact genres

3. **Context** (promoted 2026-05-14 from sub-point of Architectural) — context-window design, retrieval strategy (RAG / hybrid / agentic), packing density, information ordering, position effects, long-context vs aggressive-retrieval trade-off, compaction & summarization, attention-loss mitigation, cache hit rate, context rot defenses, late chunking, citation-density preservation, multi-document grounding, tacit/organizational knowledge surfacing, per-turn working set selection.

   Independent of Architectural because two systems with identical architecture can have radically different context strategies — and the choice usually dominates output quality. Sub-discipline with its own vocabulary ("context engineering"), its own evals (attention recall, needle-in-haystack, Lost-in-the-Middle, RULER), and its own SOTA references.

4. **Quality** — groundedness, accuracy, completeness, insight, honesty, coherence, persona, citation quality, multi-stakeholder communication modulation, affective register

5. **Production / operational** — latency, throughput, availability, observability, auditability, reproducibility, privacy, security, compliance, adversarial robustness

6. **UX / interaction** — conversational continuity, HITL, streaming UX, refusal UX, clarification UX, multi-modal output

7. **Deployment / operations** — deployment safety, per-org config, versioning, monitoring, cost controls, multi-tenancy

8. **Learning / improvement** — feedback loops, eval harnesses, continuous deployment, self-improvement, knowledge accumulation, tacit/organizational knowledge capture, network effects across deployments

9. **Enterprise** — SSO/RBAC, audit logging, data retention, export, white-labeling, SLA, onboarding

## Human-employee-replacement axes (added 2026-05-14)

Distinct stakeholders, distinct vocabularies, distinct evals. The prior collapse into Architectural/Quality/Enterprise was the blindspot this addition corrected.

10. **Behavior / Disposition** — initiative & proactivity, refusal stance, calibrated uncertainty, push-back willingness, judgment under ambiguity, risk-tolerance, conservatism vs boldness, cost-of-action / blast-radius reasoning, cost-of-error asymmetry / stakes-aware effort modulation, post-error social repair, ethical/normative refusal, counterfactual exploration, identity & personification continuity.

    The *HOW* of acting — independent of architecture (substrate) and quality (output goodness). Stakeholder: end user.

11. **Economics / Unit economics** — $/seat, $/task, $/outcome, gross margin, payback period, ROI per deployment, cost-of-failure in dollars, pricing model fit, cohort margins.

    The commercial viability of the agent itself — independent of infra cost. Stakeholder: Finance / GTM.

12. **Trust / Accountability / Governance** — legal liability, indemnification, fiduciary stance, attestation, certifications (SOC2/ISO/FedRAMP/HIPAA), insurance posture, e-discovery, regulatory positioning, legal-grade audit trails.

    The legal and social accountability layer — distinct from Enterprise IT compliance. Stakeholder: Legal / Risk.

## How to use

For each dimension: ask where v2 (or our system) stands, where the SOTA stands, where the user's competitor stands, where the median human employee in the target role stands. **A scope that does not cover every dimension where the competition (including the human baseline) wins is by definition a losing scope.** Reject it.
