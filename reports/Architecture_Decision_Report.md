# Architecture Decision Report

## Architecture Decision Records (ADRs)

### ADR-0001: Read-only Repository Intelligence
* **Decision**: Keep Repository Intelligence scanner read-only in memory.
* **Reason**: To guarantee that the analyzer does not inadvertently corrupt or rewrite codebase files during project analysis.
* **Alternatives Considered**: Self-healing Repository Scanner, Git-monitored Auto-commit Scanners.
* **Why Rejected**: Writing features during scanning introduces huge corruption risks; harder to audit and verify.
* **Consequences**: Safe, predictable repository mapping. Zero write access for analyzer runs.

### ADR-0002: Mandatory Sandbox Workspace Validation
* **Decision**: Enforce complete sandbox folder isolated checks for all generated patch applications.
* **Reason**: To avoid broken compilation, test regressions, or unverified changes entering production.
* **Alternatives Considered**: In-place production patch trials, Virtual FS in-memory simulators.
* **Why Rejected**: Direct editing has zero rollback safety; virtual simulators fail to catch real toolchain breaks.
* **Consequences**: Every patch proposal must succeed in building under the sandbox directory before it can be marked ready.

### ADR-0003: Multi-Provider Consensus Engine Routing
* **Decision**: Run multiple models concurrently and synthesize decisions via AIConsensusEngine instead of relying on a single provider.
* **Reason**: To reduce hallucinations, improve coding architecture, and eliminate vendor lock-in.
* **Alternatives Considered**: Single model orchestrator routing, Sequential fallback chains.
* **Why Rejected**: Single models fail to catch their own errors; fallback chains increase latency without providing comparative analysis.
* **Consequences**: Engineering solutions are voted upon and audited, selecting the highest-scoring model decision.

### ADR-0004: Apply Preparation & Readiness Scoring
* **Decision**: Introduce a formal preparation manifest stage with readiness scores.
* **Reason**: To make sure changes are fully prepared, verified, and score-assessed prior to user intervention.
* **Alternatives Considered**: Direct prompt-to-apply, Standard developer manual review.
* **Why Rejected**: Auto-applies skip verification rules; manual review does not provide automated safety stats.
* **Consequences**: Creates a clean, audit-logged manifest showing compilation, regressions, and approval checklist details.
