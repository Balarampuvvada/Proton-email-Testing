# Proton Mail QA

Playwright TypeScript test environment for Proton Mail's free-tier web experience.

## Current status

The project structure and public-site smoke test are ready. Before authenticated automation, manually create two free Proton Mail accounts: one sender and one receiver. Explore login, compose, drafts, inbox actions, search, filters, labels, attachments, and Undo Send with those accounts. Record observed roles, accessible names, iframe boundaries, loading states, and stable selectors before implementing account-dependent page objects.

Do not commit credentials. Supply `PROTON_TEST_EMAIL`, `PROTON_TEST_PASSWORD`, and `PROTON_RECEIVER_EMAIL` through the local environment or CI secret store. Use placeholders in documentation, for example `PROTON_TEST_EMAIL=your-test-account@proton.me`.

Copy `.env.example` to `.env`, then enter the sender and receiver values manually. The two accounts should be separate free-tier Proton Mail accounts created for testing. Authenticated specs skip while required values are blank.

## Commands

```bash
npm test
npm run test:smoke
npm run test:headed
npm run test:ui
npm run typecheck
npm run report
```

The HTML report is generated in `playwright-report/`. Failure traces, screenshots, and videos are written to `test-results/` according to the Playwright configuration.

The suite currently uses `workers: 1` because the authenticated tests share two real Proton accounts and session state. This is an environment constraint, not a Proton defect. To restore parallel execution as the suite grows, provision separate accounts or per-worker `storageState` fixtures and then remove the global serialization.

## Strategy

See [docs/test-strategy.md](docs/test-strategy.md) for scope, assumptions, risks, priorities, and the manual exploration gate. See [docs/test-cases.md](docs/test-cases.md) for the prioritized nine-area matrix.

## Defects & Findings

See [docs/defects.md](docs/defects.md) for the full log. A transient Starred-folder badge count lag was observed during manual exploratory testing (DEF-02), but direct comparison with the Starred folder showed the correct contents; it is closed as non-reproducible.

## Reflection

**What belongs in a PR suite versus a nightly suite?** PR checks should stay deterministic and fast: login success/failure, compose/send, missing-recipient validation, draft reopen, one inbox mutation, and basic search. Nightly or extended-timeout checks should cover attachment paths, cross-account propagation, filter and label rules, advanced/date search, CC/BCC, restore flows, Undo Send timing, multiple browsers, and retry-sensitive network paths. This tiering is evidenced by repeated receiver-side delivery latency in CMP-01, ATT-01, and FLT-01, including runs exceeding 60-120 seconds.

**How would I diagnose a flaky test?** First inspect the trace, screenshot, video, console, and network evidence. Then classify the failure as selector ambiguity, product readiness, test-data collision, environment/network instability, or a real regression. Replace arbitrary sleeps with locator assertions and explicit state checks, isolate data by run, and rerun the smallest reproducible test before changing retries.

**How would this scale to 200+ tests?** Keep page objects focused on user capabilities, centralize fixtures and data factories, tag tests by suite and risk, use project-level authentication state only after validating its security, shard CI by file, retain traces only for failures, and publish HTML/JUnit results. A small number of API helpers may prepare data, but critical user journeys should still assert through the UI.

**Why Playwright?** Auto-waiting, locator assertions, trace recording, screenshots, video, and the HTML report address synchronization and failure evidence without custom framework code.

**What is intentionally not claimed yet?** Product defects are recorded only as reproduced observations from the two test accounts, with unresolved root causes explicitly marked open. No authenticated test is presented as complete before the real UI has been explored.

## Layout

```text
tests/       Category specs
pages/       Page Object Model
fixtures/    Test data and future fixtures
reports/     Reserved for generated reports
docs/        Strategy, cases, and defects
```