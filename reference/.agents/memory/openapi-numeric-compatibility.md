---
name: OpenAPI numeric compatibility
description: Generator/runtime compatibility note for API contract changes.
---

Use `type: number` for numeric fields in new OpenAPI contracts in this workspace unless the Zod dependency is upgraded together with the generator configuration.

**Why:** The installed Orval/Zod combination generated `zod.int()`, but the workspace runtime exposes the older Zod API and fails the shared library typecheck.

**How to apply:** After changing the OpenAPI spec, run codegen and the root typecheck before relying on generated client or server types.