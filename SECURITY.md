# Security policy

Report vulnerabilities privately through [GitHub private vulnerability reporting](https://github.com/StellarDevTools/stellar-devkit/security/advisories/new). Include a minimal reproduction, affected commit and impact; redact credentials. Do not open a public vulnerability issue. No response-time guarantee is advertised.

This is a development project without a verified published release/support window. Fixes target the current main branch.

Tools are read-only with respect to the blockchain. They never sign or submit transactions. Doctor reads local manifests and optionally runs fixed, time-bounded tool version probes; it does not execute project builds. MCP Doctor disables these probes.

Never pass secret seeds, recovery phrases, passwords or provider credentials in publicly shared output. Simulation envelopes and event values can contain application data. Error context redacts recognizable Stellar secret seeds, URLs and common credential assignments; this is not a comprehensive data-loss prevention system.

Known limits: no global rate limiter, endpoint reachability is not a trust guarantee, local HTTP is allowed, provider retention varies, and there has been no independent security audit. The stdio MCP server assumes a trusted local user and is not a multi-tenant filesystem sandbox. Do not expose it as an unauthenticated network service.

Dependency advisories and release artifacts must be reviewed before publishing; passing unit tests is not a security certification.
