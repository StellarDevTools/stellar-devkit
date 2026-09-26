# Release Checklist

Comprehensive checklist for releasing Stellar DevKit to production.

---

## Pre-Release Validation

### Code Quality

- [ ] All tests passing (`pnpm test`)
- [ ] No linting errors (`pnpm lint`)
- [ ] No type errors (`pnpm typecheck`)
- [ ] All packages build successfully (`pnpm build`)
- [ ] No console errors in web application
- [ ] No TODOs or FIXMEs in committed code

### Documentation

- [ ] README.md is up-to-date
- [ ] CHANGELOG.md updated with release notes
- [ ] CONTRIBUTING.md is current
- [ ] SECURITY.md is current
- [ ] ROADMAP.md reflects completed phases
- [ ] All phase reports exist (PHASE_1_REPORT.md, PHASE_2_REPORT.md)
- [ ] API documentation complete (if applicable)
- [ ] CLI documentation complete (docs/CLI.md)

### Security Audit

- [ ] No private keys or seed phrases in code
- [ ] No API keys or credentials committed
- [ ] No .env files committed
- [ ] All secrets in .gitignore
- [ ] SECURITY.md includes vulnerability reporting instructions
- [ ] Dependencies scanned for known vulnerabilities (`pnpm audit`)

### Legal & Licensing

- [ ] LICENSE file exists (Apache 2.0)
- [ ] Copyright notices in LICENSE are current
- [ ] All dependencies have compatible licenses
- [ ] CODE_OF_CONDUCT.md exists (Contributor Covenant)
- [ ] Attribution for third-party code/assets

---

## Package Preparation

### Core Packages (`@stellar-devkit/core`, `@stellar-devkit/diagnostics`, `@stellar-devkit/stellar`)

- [ ] Version bumped in package.json (follow semver)
- [ ] `publishConfig.access` set to `public`
- [ ] `files` array includes only necessary files
- [ ] `exports` field configured correctly
- [ ] README included in package
- [ ] Build output in `dist/` is committed or generated

### CLI Package (`@stellar-devkit/cli`)

- [ ] Version matches core packages
- [ ] `bin` entry point correct
- [ ] Shebang line in CLI entry: `#!/usr/bin/env node`
- [ ] CLI executable bit set (chmod +x bin/stellar-dev.js)
- [ ] Test CLI installation: `npm link` + `stellar-dev --version`
- [ ] Help text is accurate and complete
- [ ] All commands functional

### UI Package (`@stellar-devkit/ui`)

- [ ] Components exported correctly
- [ ] No dev dependencies in dependencies
- [ ] Peer dependencies declared
- [ ] Tailwind config exported if needed

### MCP Server (`@stellar-devkit/mcp-server`)

- [ ] Dependencies installed and tested
- [ ] `@modelcontextprotocol/sdk` version compatible
- [ ] README includes installation instructions
- [ ] All 8 tools functional
- [ ] Test with Claude Desktop config

### GitHub Action (`@stellar-devkit/github-action`)

- [ ] Built with @vercel/ncc into `dist/`
- [ ] `dist/` directory committed
- [ ] action.yml metadata complete (name, description, branding)
- [ ] Inputs and outputs documented
- [ ] README includes usage examples
- [ ] Tested in a sample workflow

---

## Version Numbers

Update version in all package.json files:

- [ ] Root package.json: `0.1.0`
- [ ] packages/core/package.json: `0.1.0`
- [ ] packages/diagnostics/package.json: `0.1.0`
- [ ] packages/stellar/package.json: `0.1.0`
- [ ] packages/cli/package.json: `0.1.0`
- [ ] packages/ui/package.json: `0.1.0`
- [ ] apps/web/package.json: `0.1.0`
- [ ] integrations/mcp/package.json: `0.1.0`
- [ ] integrations/github-action/package.json: `0.1.0`

**Versioning Strategy:** Follow Semantic Versioning 2.0.0
- MAJOR: Breaking changes
- MINOR: New features, backward-compatible
- PATCH: Bug fixes, backward-compatible

---

## npm Publishing

### Dry Run

- [ ] `pnpm build` in all packages
- [ ] Test publish dry-run: `npm publish --dry-run` (each package)
- [ ] Review files to be published
- [ ] Verify no sensitive files included

### Authentication

- [ ] npm account created
- [ ] npm org created: `@stellar-devkit`
- [ ] npm login: `npm login`
- [ ] 2FA enabled on npm account

### Publish Packages (in order)

1. [ ] Publish `@stellar-devkit/stellar`: `cd packages/stellar && npm publish --access public`
2. [ ] Publish `@stellar-devkit/core`: `cd packages/core && npm publish --access public`
3. [ ] Publish `@stellar-devkit/diagnostics`: `cd packages/diagnostics && npm publish --access public`
4. [ ] Publish `@stellar-devkit/ui`: `cd packages/ui && npm publish --access public`
5. [ ] Publish `@stellar-devkit/cli`: `cd packages/cli && npm publish --access public`
6. [ ] Publish `@stellar-devkit/mcp-server`: `cd integrations/mcp && npm publish --access public`

### Verify npm Installation

- [ ] Test global CLI install: `npm install -g @stellar-devkit/cli`
- [ ] Test CLI works: `stellar-dev --version`
- [ ] Test CLI commands: `stellar-dev --help`
- [ ] Test MCP server: `npm install -g @stellar-devkit/mcp-server`
- [ ] Check npm package pages are correct

---

## GitHub Action Publishing

- [ ] Build action: `cd integrations/github-action && npm run build`
- [ ] Verify dist/ exists and is committed
- [ ] Create release tag: `git tag github-action-v1.0.0`
- [ ] Push tag: `git push origin github-action-v1.0.0`
- [ ] Create GitHub Release with action tag
- [ ] Publish to GitHub Marketplace (via GitHub UI)
- [ ] Test action from marketplace: `uses: stellar-devkit/stellar-devkit/integrations/github-action@v1`

---

## Web Application Deployment

- [ ] Vercel account created
- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Connect GitHub repo to Vercel project
- [ ] Configure build settings:
  - Build Command: `cd apps/web && pnpm build`
  - Output Directory: `apps/web/.next`
  - Install Command: `pnpm install`
  - Framework: Next.js
- [ ] Set environment variables (if any)
- [ ] Deploy to production: `vercel --prod`
- [ ] Test deployed application
- [ ] Configure custom domain (if available): `stellar-devkit.dev`
- [ ] Update README with live URL

---

## GitHub Repository

### Release Tag

- [ ] Create release tag: `git tag v0.1.0`
- [ ] Push tag: `git push origin v0.1.0`

### GitHub Release

- [ ] Create GitHub Release for v0.1.0
- [ ] Title: "v0.1.0 - Initial Public Release"
- [ ] Description includes:
  - Release highlights
  - Features included
  - Installation instructions
  - Breaking changes (if any)
  - Known limitations
  - Link to CHANGELOG
- [ ] Attach built assets (if applicable)
- [ ] Mark as "Latest Release"

### Repository Settings

- [ ] Repository is public
- [ ] Description set: "Developer toolbox for Stellar and Soroban"
- [ ] Topics added: `stellar`, `soroban`, `blockchain`, `developer-tools`, `typescript`
- [ ] Website URL set (live URL or GitHub Pages)
- [ ] Issues enabled
- [ ] Discussions enabled
- [ ] Wiki disabled (unless needed)
- [ ] Projects enabled (optional)
- [ ] Branch protection on `main`:
  - Require PR reviews
  - Require status checks (CI)
  - No force pushes

### Issue Templates

- [ ] Bug report template exists
- [ ] Feature request template exists
- [ ] Diagnostic rule template exists
- [ ] Documentation template exists

### PR Template

- [ ] Pull request template exists (.github/PULL_REQUEST_TEMPLATE.md)

---

## Community & Marketing

### Stellar Ecosystem

- [ ] Announce on Stellar Discord (#developers channel)
- [ ] Post in Stellar Developer Google Group
- [ ] Submit to Stellar Community Fund (if applicable)
- [ ] List in Stellar ecosystem directory
- [ ] Tag @StellarOrg on Twitter/X

### Developer Communities

- [ ] Post on dev.to with tutorial
- [ ] Post on Hacker News (Show HN)
- [ ] Post on r/stellar (Reddit)
- [ ] Post on r/soroban (if exists)
- [ ] Tweet announcement thread
- [ ] Post on LinkedIn (professional networks)

### Content

- [ ] Record demo video (3-5 minutes)
- [ ] Write blog post: "Introducing Stellar DevKit"
- [ ] Create tutorial: "Getting Started with Stellar DevKit"
- [ ] Create tutorial: "Using DevKit with Claude Desktop (MCP)"
- [ ] Update personal portfolio/website

### Outreach

- [ ] Email Stellar Developer Advocates
- [ ] Reach out to Stellar dApp developers
- [ ] Share in relevant Discord servers
- [ ] Share in relevant Telegram groups

---

## Monitoring & Feedback

### Analytics

- [ ] npm download tracking set up
- [ ] GitHub stars/forks tracking
- [ ] Web analytics (if applicable): Plausible or Fathom
- [ ] Error tracking (if needed): Sentry

### Feedback Channels

- [ ] Monitor GitHub Issues
- [ ] Monitor GitHub Discussions
- [ ] Monitor Stellar Discord mentions
- [ ] Set up email for security reports: security@stellar-devkit.dev

### First Week Actions

- [ ] Respond to all issues within 24 hours
- [ ] Triage bugs and feature requests
- [ ] Update CONTRIBUTOR_BACKLOG.md with community suggestions
- [ ] Celebrate first external contribution 🎉

---

## Post-Release

### Immediate Follow-Up (Week 1)

- [ ] Fix critical bugs reported in first 7 days
- [ ] Patch release if needed (v0.1.1)
- [ ] Thank early adopters and contributors
- [ ] Gather feedback for roadmap adjustments

### Short-Term (Month 1)

- [ ] Review analytics and usage patterns
- [ ] Address top-voted feature requests
- [ ] Plan v0.2.0 features
- [ ] Improve documentation based on common questions

### Long-Term

- [ ] Apply to Stellar Wave program
- [ ] Apply to Stellar Drips program
- [ ] Submit to Stellar Community Fund (next round)
- [ ] Explore partnerships with Stellar projects

---

## Rollback Plan

If critical issues are discovered post-release:

1. [ ] Unpublish broken npm packages: `npm unpublish @stellar-devkit/[package]@[version]`
2. [ ] Publish hotfix version
3. [ ] Mark GitHub Release as "Pre-release"
4. [ ] Announce issue and fix timeline in GitHub Issues
5. [ ] Update README with known issues section

---

## Release Artifacts Checklist

After release, verify these exist:

- [ ] npm packages published: https://www.npmjs.com/package/@stellar-devkit/cli
- [ ] GitHub Release created: https://github.com/stellar-devkit/stellar-devkit/releases/tag/v0.1.0
- [ ] GitHub Action published: https://github.com/marketplace/actions/stellar-devkit
- [ ] Web app deployed: https://stellar-devkit.dev (or Vercel URL)
- [ ] Git tag created: v0.1.0
- [ ] CHANGELOG.md updated

---

## Sign-Off

**Release Manager:** _________________  
**Date:** _________________  
**Version:** v0.1.0

**Checklist Completed:** [ ] Yes [ ] No

**Notes:**

---

**Template Version:** 1.0  
**Last Updated:** 2026-09-26
