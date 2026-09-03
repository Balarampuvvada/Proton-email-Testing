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