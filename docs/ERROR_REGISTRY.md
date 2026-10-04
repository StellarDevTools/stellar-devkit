# Adding error explanations

Mappings live in `packages/stellar/src/errors.ts`; diagnostics re-exports them for compatibility. This lets core simulation and transaction inspection reuse the registry without a cycle.

Add a stable normalized code, precise pattern, developer explanation, likely causes and recommendations. Put specific patterns ahead of generic ones. Preserve custom contract error numbers in safe context without inventing meanings. Never recommend that a user provide private keys to DevKit.

Add an example for every mapping to `packages/stellar/test/errors.test.ts`, plus near-miss/precedence tests where patterns overlap. Keep context redaction tests. Unknown errors must stay UNKNOWN_ERROR. Registry entries are advisory, not proofs of root cause.
