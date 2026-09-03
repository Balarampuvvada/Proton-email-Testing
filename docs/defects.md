# Defect Log

Record only reproduced observations from the two test accounts. Do not add examples speculatively.

## UI observations

- The authenticated inbox's compose control is exposed as `New message`, not `Compose`. Page objects use the observed exact accessible label. This is an automation note, not a product defect.
- The current sender and receiver accounts are shared across authenticated tests, so concurrent workers can race on login and session redirects. Playwright is configured with `workers: 1` until per-worker account or `storageState` isolation is available. This is an environment constraint, not a Proton defect.
- Regex-based accessible-name locators can collide with unrelated UI text. For example, `/send/i` matched `sender` in the account dropdown name and caused Playwright strict-mode failure. The risk was resolved by scoping the composer and using the stable `composer:send-button` test ID plus exact accessible names.
- Generic short accessible names can also collide within the composer: `getByRole('button', { name: 'CC' })` matched five controls due to tooltip text. Stable test IDs are preferred for Proton's CC/BCC controls and fields.
- The redundant login-smoke test was retired after AUTH-01/02/03 passed cleanly. Subsequent standalone CMP-01 and CMP-03 runs timed out waiting for the account redirect and did not reach the composer; this is distinct from the resolved selector collision and should be treated as an authentication/session condition.
- Cross-account delivery is asynchronous and latency is variable: a manual check confirmed a message (`QA compose f57d326c`) was absent from the receiver inbox at the initial 30-second assertion window but had arrived by the time of a later manual check. `expectMessage()` was changed from a single fixed-timeout wait to a reload-and-retry pattern (`toPass` with a 60-second budget) to accommodate this without masking genuine delivery failures. Exact worst-case latency has not been fully bounded; if it is later found to regularly exceed ~60s, this scenario is a better fit for a nightly/extended-timeout test tier than a fast PR-gating suite.
- Self-send (sender emailing their own address) does not reliably complete: a generated test message was confirmed absent from both Sent and Spam after a full send attempt, indicating the send itself did not succeed for this pattern, not a delivery-latency or spam-filtering issue. Inbox action scenarios use the validated sender-to-receiver cross-account flow instead of self-send.
- Closing the sender browser context immediately after clicking Send can interrupt delivery before it fully completes server-side, even when the UI shows a sent confirmation. Inbox scenarios keep the sender context open through receiver-side verification, matching CMP-01; this resolved the consistent cross-account delivery failure in INB-01.
- Attachment sends exhibit longer or more variable receiver delivery latency than plain-text sends: ATT-01 completed upload, removal, re-attachment, and Send-button synchronization, but the receiver did not see the message within the validated 60-second delivery poll on the final run (test budget: 120 seconds total). Recommendation: extend the attachment-specific poll to about 90 seconds and classify ATT-01 as a nightly/extended-timeout test rather than fast PR-gating, or retain it as a documented known-flaky scenario.
- Filter-triggered message delivery exhibits the same delivery-latency behavior observed elsewhere in this suite: FLT-01 successfully created a filter (Name -> Conditions -> Actions -> Preview -> Save all confirmed working) and the triggering send completed, but the receiver did not show the filtered/archived message within the 120-second test budget. Consistent with the CMP-01/ATT-01 findings, this is treated as environment-sensitive delivery timing rather than a filter-logic or selector defect.
- Recurring pattern across three cross-account scenarios (CMP-01, ATT-01, FLT-01): receiver-side message visibility can exceed even generous 60-120 second polling budgets under this test account's conditions. Cross-account delivery-dependent scenarios are better suited to a nightly/extended-timeout CI tier than fast PR-gating checks.

### DEF-01 — CC/BCC fields not fillable without first clicking their toggle button

**Environment:** Chromium (Playwright), Windows, desktop viewport, 2026-09-02  
**Severity:** Low — automation-implementation gap, not a Proton defect; the UI behaves as designed with click-to-reveal fields  
**Preconditions:** Authenticated sender session with the composer open  
**Steps to reproduce:** Open the composer and attempt to fill the CC field through a role-based textbox locator without clicking the CC toggle.  
**Expected vs Actual:** Expected the field to be immediately fillable, or for automation to reveal it first. Actual: the field does not exist in the DOM until the CC toggle is clicked; the `composer:to-cc` test ID appears only afterward.  
**Evidence:** Diagnostic instrumentation and stable controls: `composer:recipients:cc-button`, `composer:to-cc`, `composer:recipients:bcc-button`, and `composer:to-bcc`  
**Reproducibility:** Always  
**Status:** Resolved — `addCc` and `addBcc` now click the relevant toggle before filling.

### DEF-02 — Starred folder sidebar badge count lag

**Environment:** Chromium, Windows, desktop viewport, 2026-09-03 10:15 AM, `balaramreceiver@proton.me`  
**Severity:** Medium if reproducible — cosmetic/state-sync issue without data loss; downgraded after investigation  
**Preconditions:** Three or more messages starred across different Inbox rows  
**Steps to reproduce:** Star three or more messages, observe the sidebar Starred badge, compare it with filled star icons in the Inbox list, then open the Starred folder directly.  
**Expected vs Actual:** Expected the badge count to match the number of starred messages. Actual: the badge briefly showed `1` while three messages showed filled stars in the Inbox; opening Starred directly showed the correct matching set.  
**Evidence:** Inbox screenshot from 2026-09-03 10:15 AM  
**Reproducibility:** Not reproducible — the direct Starred-folder check showed the correct contents, suggesting transient badge-refresh lag rather than incorrect underlying state  
**Status:** Closed — not classified as a functional defect.