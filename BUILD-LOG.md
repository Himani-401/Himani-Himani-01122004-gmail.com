# BUILD-LOG

## 2026-09-26 · Phase 0 — orientation

Installed the starter, read the brief and the database contract, and ran the first public checks against the untouched skeleton. The first unexpected failure was not the JWT logic itself; it was the environment mismatch: the project is written for a Unix-like shell and a Node runtime that is compatible with `better-sqlite3`, while this Windows sandbox is running Node 24 and PowerShell. This forced a platform-aware fix before the app could actually run.

## 2026-09-26 · Phase 1 — token verification

Implemented the access-token verification contract in [starter/server/auth.js](starter/server/auth.js): malformed segment counts, invalid base64 JSON, algorithm pinning, constant-time signature checks, expiry half-open handling, issuer/audience validation, and required `jti` checks. The verification test suite produced a clean pass on the JWT contract once the implementation matched the published rules.

## 2026-09-26 · Phase 2 — auth context and protection boundaries

The core model is that the token's `org` claim is the only org the caller may address. A request naming a different org is structurally impossible, not a filtered error. This is enforced in [starter/server/context.js](starter/server/context.js) by refusing tokens with missing membership, checking org deletion and membership removal, and rejecting cross-org access with a not-found path instead of a permission error.

## 2026-09-26 · Phase 3 — permission resolution

The server-side resolution engine in [starter/server/permissions.js](starter/server/permissions.js) is the only source of allow/deny decisions. The mistake to avoid was hard-coding a client-side role matrix; the correct model is: identity gate, applicable grants, deny wins, baseline allow, then implicit deny. The permission tests rely on that order and on per-device grant scoping.

## 2026-09-26 · Phase 4 — DB compatibility and runtime fix

Mistake: I assumed the project would work as-is in a default Windows environment. The exact failure was `better-sqlite3` failing under Node 24 and the `rm` command not existing in PowerShell. I corrected that by switching validation to Node 22 and converting the reset/start logic to cross-platform file removal and URL/path handling. The necessary fix is recorded in [starter/package.json](starter/package.json), [starter/scripts/load-db.js](starter/scripts/load-db.js), and [starter/playwright.config.js](starter/playwright.config.js).

## 2026-09-26 · Phase 5 — repo state and submission constraints

The repository already contains the working reference implementation under [q1-starter](q1-starter) and the handout under [starter](starter). For a real submission, the public repository must be named after the author and must include the root-level decision artifact and build log in the repo root; without git history and a public remote, the form cannot be accepted. I also recorded the actual constraint that the external submission form cannot be completed from this local environment because no GitHub login or public repo is available here.

## Open threads

- The app is logically present, but the browser suite still times out in this sandbox when launched through Playwright because the environment does not provide a fully working end-to-end browser host for the full UI run.
- The concrete runtime requirement discovered is: use Node 22, not Node 24, and avoid Unix-only shell commands in the project scripts.
- The external form and GitHub repo publication step remains outside this local workspace and must be done on the actual submission machine or by the project owner.
