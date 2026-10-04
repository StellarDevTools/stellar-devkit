# Web deployment

The repository homepage is https://stellar-devkit-eta.vercel.app (HTTP 200 verified during the 2026-10-03 audit). Vercel reported successful deployments for starting commit 4e83e9b. The final readiness report records validation of this change separately.

For Vercel, import StellarDevTools/stellar-devkit and set:

- Framework: Next.js
- Root directory: `apps/web`
- Include source files outside the root directory: enabled (workspace packages are required)
- Install command: `pnpm install --frozen-lockfile`
- Build command: `cd ../.. && pnpm exec turbo run build --filter=@stellar-devkit/web...`
- Output directory: Next.js default `.next`, relative to apps/web
- Node.js: 22

The repository pins pnpm 8.15.0. Commit lockfile updates; do not work around mismatches by disabling frozen installs. Build shared workspace packages before Next.js. `apps/web/vercel.json` supplies the build/install commands for this root configuration.

The current client-side tools require no server secrets. Public RPC/Horizon requests require suitable provider CORS support. Never embed private provider credentials in browser code or NEXT_PUBLIC variables. Mainnet tools need user-configured endpoints; verify them independently.

Local production check: `pnpm build`, then `pnpm --filter @stellar-devkit/web start`. Verify all tool routes and error states before advertising a new deployment. A build success does not prove live-network workflows or browser accessibility have been tested.
