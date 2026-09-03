# Proton Mail QA

Playwright TypeScript test environment for Proton Mail's free-tier web experience.

## Prerequisites

- Node.js 20 or newer
- npm
- Chromium (installed by the setup commands below)
- Two separate Proton Mail accounts: one sender and one receiver

## Quick start

Clone the repository, install dependencies, and copy the environment template:

```bash
git clone https://github.com/Balarampuvvada/Proton-email-Testing.git
cd Proton-email-Testing
npm ci
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Edit `.env` with the two test accounts:

| Variable | Required | Purpose |
| --- | --- | --- |
| `BASE_URL` | No | Mail application URL; defaults to `https://mail.proton.me` |
| `PROTON_TEST_EMAIL` | Yes for authenticated tests | Sender email address |
| `PROTON_TEST_PASSWORD` | Yes for authenticated tests | Sender password |
| `PROTON_RECEIVER_EMAIL` | Yes for cross-account tests | Receiver email address |
| `PROTON_RECEIVER_PASSWORD` | Yes for receiver login | Receiver password |

Never commit `.env` or real credentials. Authenticated tests skip with a clear message when required values are absent.

Install the browser used by the Playwright project:

```bash
npx playwright install chromium
```

Run the typecheck and public smoke test first:

```bash
npm run typecheck
npx playwright test tests/smoke.spec.ts --project=chromium --workers=1
```

## Running tests

Common commands:

```bash
npm test
npm run test:smoke
npm run test:headed
npm run test:ui
npm run typecheck
npm run report
```

Run one category or scenario:

```bash
npx playwright test tests/auth --project=chromium --workers=1
npx playwright test tests/compose/compose.spec.ts -g "CMP-01" --project=chromium --workers=1 --retries=0
npx playwright test tests/attachments/attachments.spec.ts -g "ATT-01" --project=chromium --workers=1 --retries=0
```

Use `--headed` when inspecting the live UI. Use `--ui` for Playwright's interactive runner.

The HTML report is generated in `playwright-report/`. Failure traces, screenshots, and videos are written to `test-results/` according to the Playwright configuration.

The suite currently uses `workers: 1` because the authenticated tests share two real Proton accounts and session state. This is an environment constraint, not a Proton defect. To restore parallel execution as the suite grows, provision separate accounts or per-worker `storageState` fixtures and then remove the global serialization.

## CI

The pull-request workflow is [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml). It installs dependencies and Chromium, runs typecheck, executes the Chromium suite with one worker, and uploads reports/results as artifacts.

The scheduled extended workflow is [`.github/workflows/playwright-nightly.yml`](.github/workflows/playwright-nightly.yml). It runs the delivery-sensitive Compose, Attachments, and Filters suites with a longer job budget.

Configure these repository secrets under **Settings → Secrets and variables → Actions** before expecting authenticated CI coverage:

`BASE_URL`, `PROTON_TEST_EMAIL`, `PROTON_TEST_PASSWORD`, `PROTON_RECEIVER_EMAIL`, and `PROTON_RECEIVER_PASSWORD`.

Without account secrets, authenticated tests are intentionally skipped; the smoke test and typecheck can still run.

## Strategy

See [docs/test-strategy.md](docs/test-strategy.md) for scope, assumptions, risks, priorities, and the manual exploration gate. See [docs/test-cases.md](docs/test-cases.md) for the prioritized nine-area matrix.

## Defects & Findings

See [docs/defects.md](docs/defects.md) for the full log. A transient Starred-folder badge count lag was observed during manual exploratory testing (DEF-02), but direct comparison with the Starred folder showed the correct contents; it is closed as non-reproducible.

## Automation Quality Review

### 1. Which tests did you deliberately choose NOT to automate, and why?

Folders & Labels (creation, move, apply/remove), Scheduled Send, and password-protected email were kept manual. Folders/Labels required a focused live-DOM diagnostic on the `toolbar:moveto` menu and folder-creation modal that time did not allow; automating from guessed selectors after prior collision incidents was judged riskier than leaving it manual. Scheduled Send needs either long-running tests or system-time mocking to verify the scheduled state fires correctly, which is disproportionate setup cost for one scenario. Password-protected email is security-sensitive and its secondary-password and recipient-unlock flow outweighs its regression value relative to the core scope. General cosmetic/visual states, including sidebar badge counts and storage banners, were handled through manual exploratory testing; this surfaced the transient DEF-02 observation, which was closed after direct verification.

### 2. Which 5 tests would you run on every pull request? Which would you run nightly?

**Every PR (fast and deterministic):** AUTH-01, AUTH-02, CMP-02, SRC-02, and DFT-02. These use single-account, same-session assertions without real cross-account delivery waits and provide quick signal on core regressions.

**Nightly (cross-account and delivery-sensitive):** CMP-01, ATT-01, FLT-01, INB-01/02/03, and ASY-01. These require a second authenticated context or real message delivery. CMP-01, ATT-01, and FLT-01 have documented delivery variance that can exceed 60–120 seconds, so gating every PR on them would reduce CI trust and slow feedback. The project implements this split in [playwright.yml](.github/workflows/playwright.yml) and [playwright-nightly.yml](.github/workflows/playwright-nightly.yml).

### 3. How would you diagnose a test that passes locally but fails intermittently in CI?

First inspect the CI trace, screenshot, video, console, and network evidence from the uploaded artifacts rather than reproducing blindly. Compare the failure point with a known-good local run, then classify it as selector ambiguity, readiness, test-data collision, session or network instability, or a real regression. This suite used that process to identify the `/send/i` versus `sender` strict-mode collision, shared-account session redirects, and sender-context closure interrupting server-side delivery. Replace arbitrary sleeps with locator assertions and explicit state checks, isolate data by run, and rerun the smallest reproducible test before changing retries.

### 4. How would you reduce test-suite flakiness if the UI changes frequently?

Prefer stable `data-testid` selectors and treat remaining role/name locators as deliberate, reviewed exceptions. Centralize selectors in Page Objects so UI changes require one focused edit. Use live-DOM diagnostic specs before changing selectors, then delete diagnostics after the evidence is captured. Keep explicit readiness assertions, unique generated subjects, bounded polling, and trace-on-retry so failures remain actionable.

### 5. How would you scale this suite from 20 tests to 200+ tests while keeping maintenance manageable?

Introduce `storageState` authentication per role, then provision separate accounts or isolated states per worker so execution can be parallelized instead of relying on `workers: 1`. Add a dedicated fixture and test-data layer with setup and teardown helpers, using API-assisted preparation if the provider exposes it, rather than UI-driven setup for every test. Split smoke, PR-gating, and nightly extended tiers as first-class CI concepts, shard by file, retain traces only for failures, and publish HTML/JUnit results.

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