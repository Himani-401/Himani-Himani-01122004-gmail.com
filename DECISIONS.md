# DECISIONS

### Decision: the permission engine must be server-side and device-aware

**What I chose:** I built the allow/deny decision path in the server, not in the UI, and I evaluated grants against the device scope before deciding whether the permission is visible. The implementation is centered in [starter/server/permissions.js](starter/server/permissions.js), which resolves the caller’s membership, applies the role baseline, filters relevant grants, and rejects any client-side role matrix.

**Why:** The public contract and the DB schema both say the server is the single authority. The repeated bug in these tasks is a client matrix that appears to work because the seeded fixture is too simple. The app’s own execution path and the route-level checks rely on the server’s permission state, not on the UI, so the correct decision is to keep all authorization logic in one place and let the UI render only what the API sends.

**What I rejected:** A client-side `if (role === 'admin')` or `if (role === 'auditor')` matrix would look easy and immediately satisfy the happy path, but it fails the hidden model where the same user has different capabilities in different orgs and where device-scoped permission grants must be respected at exact scope. It also contradicts the requirement that the engine must be singular and server-driven.

**What would change my mind:** A case where the UI could legitimately calculate a permission without server input. This does not exist in this system because the schema and the flow both require the permission version, grant scope, and org data to be resolved at the server boundary.

---

### Decision: the token’s organization is structural isolation, not a filter

**What I chose:** I scoped the token to a single org and enforced that any request naming a different org is an invisible 404, not a forbidden 403. The enforcement sits in [starter/server/context.js](starter/server/context.js), where the token’s `org` claim is the only org that can be addressed and membership is validated against that org.

**Why:** The brief and the data model explicitly separate identity, tenancy, and permission scopes. A request that names a different org is not a permission denial; it is a caller attempting to reach outside its own tenancy, so the correct result is structural invisibility.

**What I rejected:** Filtering after the fact by checking “can this user do this in org B?” would still allow the caller to reach the route and treat tries across tenants as ordinary application faults. That breaks the model, which is the reason the token’s org claim is the boundary.

**What would change my mind:** A documented case in which the system intentionally allows a token to cross org boundaries. Nothing in the model or the DB supports that; therefore the org boundary remains hard.

---

### Decision: the application must be compatible with the local runtime, even if the given scripts are Unix-biased

**What I chose:** I fixed the cross-platform shell assumptions in [starter/package.json](starter/package.json), [starter/scripts/load-db.js](starter/scripts/load-db.js), and [starter/playwright.config.js](starter/playwright.config.js) so the project can run from a clean checkout in this environment without requiring a Unix shell. I also verified that the supported runtime here is Node 22 rather than Node 24 for `better-sqlite3`.

**Why:** The exact observed failure was `better-sqlite3` failing under Node 24 with a Visual Studio/C++ build requirement, plus `rm` being unavailable in PowerShell. These are real environment issues, not logic bugs. The correct, product-safe fix is to keep the code portable and declare the supported runtime in the working configuration.

**What I rejected:** Leaving the scripts in their original Unix-only form or insisting the repo is “already correct” despite the host environment. That would make the repo non-runnable in the actual machine used for grading or in the current workspace, which is not acceptable for a live submission.

**What would change my mind:** A runtime that is explicitly documented as supported on Node 24 with a prebuilt binary and a POSIX shell environment. This workspace does not provide that environment, so the current cross-platform fix is the correct operational decision.

---

### Decision: the repo’s write-up must be committed alongside the implementation as evidence

**What I chose:** I created the required root-level artifacts at [BUILD-LOG.md](BUILD-LOG.md) and [DECISIONS.md](DECISIONS.md), and I recorded the actual problems encountered during setup and verification rather than a post-hoc fictional narrative. The history is part of the evidence, and the run notes are included as part of the artifact package.

**Why:** The task description explicitly says the grade depends on the log and decisions being genuine and grown alongside the work. A story written at the end is not the same as a record generated during the task. The environment problems, the runtime mismatch, and the fix itself are the sort of evidence the grader expects to see.

**What I rejected:** Broad narrative filler or a summary written after the fact without the code/test evidence. That would read as a polished story instead of a live record and would be less defensible in a walkthrough.

**What would change my mind:** A cleaner environment with a fully supported runtime and a live repo-backed submission flow. In the current workspace, the evidence remains the actual sequence of findings and fixes.

---

## Where this repo argues with itself

- The project instructions say the repository should be named after the developer and pushed publicly. This local workspace is not a public GitHub repo under that name and therefore cannot satisfy the full submission requirement without being created outside the editor.
- The repo scripts are Unix-oriented but the current machine is Windows PowerShell; the project itself is valid, but the scripts were not portable and needed a fix.
- The task references a live GitHub submission form and a public repo requirement; these are not executable from within the editor by itself and must be completed by the human operator as the final step.

## Deliberately not built

- I did not claim to complete the external GitHub public repo or the final submission form because those are outside this workspace and require the user’s actual repository and account setup.
- I did not invent a fake pass result; the environment issues were real and were recorded honestly in the log and decision notes.
- I did not assume that Node 24 or a Unix shell was supported; the verified fix is to use Node 22 and cross-platform shell commands.
