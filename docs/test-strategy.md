# Proton Mail Test Strategy

## Scope

Validate high-value free-tier web-mail workflows across authentication, composing and sending, drafts, inbox actions, search, filters, labels/folders, attachments, and asynchronous Undo Send. Focus on observable user outcomes between the sender and receiver accounts.

## Assumptions

- Two manually created free-tier accounts are available: sender and receiver.
- Paid plans, custom domains, storage limits, mobile apps, and third-party clients are out of scope.
- Tests run against a non-production test-data convention and never store credentials in source control.
- Proton may change markup, loading behavior, or security challenges; selectors must be based on observed accessible UI and reviewed when failures occur.

## Priorities

P0 protects account access and message integrity. P1 covers core daily mail actions and cross-account delivery. P2 covers useful power-user workflows and recovery. P3 covers low-value combinations, cosmetic details, and scenarios better suited to manual exploratory testing.

## Automation policy

Automate repeatable, deterministic journeys with clear assertions and useful failure evidence. Keep exploratory UX, CAPTCHA/security challenges, visual nuance, and one-off provider behavior manual. Use explicit locator-based readiness checks, isolated subjects, and trace-on-retry rather than fixed delays.

Folder creation and arbitrary folder movement remain manual initially: direct archive/trash/restore coverage is automated, while the folder-creation UI and `toolbar:moveto` menu require a focused live-DOM pass before adding stable selectors.

## Execution order

1. Manually create and explore sender and receiver accounts.
2. Implement and stabilize P0 Auth and Compose journeys.
3. Add P1 Drafts, Inbox, Search, Attachments, and Undo Send coverage.
4. Add P2 Filters and Labels/Folders after observing their real controls and synchronization behavior; keep LAB-02 manual until folder creation and move-menu behavior are confirmed.
5. Run the fast PR subset on every change and the broader cross-account suite nightly.

## Completion criteria

Each automated case must have isolated data, a meaningful user-facing assertion, and failure evidence through the Playwright report. Cross-account cases must prove sender-side send completion and receiver-side subject/body or attachment visibility. A blocked CAPTCHA, unavailable account, or unconfirmed selector is reported as a prerequisite, not silently retried as a product failure.

## Exclusions

CAPTCHA solving, account creation, recovery flows, paid-only features, mobile/native clients, third-party integrations, and pixel-perfect visual testing are excluded from the automated suite.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Delayed mail or folder synchronization | Poll with bounded assertions and capture timestamps/message IDs. |
| Rich-text mail body iframe changes | Discover the frame from observed DOM/accessibility behavior; assert body content after save/send. |
| Rate limits or security challenges | Keep data volume low, avoid parallel use of one account, and mark blocked cases manual. |
| Shared account state | Use unique subjects per run and clean up created messages where safe. |
| Selector churn | Prefer roles, labels, and stable test IDs; centralize selectors in page objects. |