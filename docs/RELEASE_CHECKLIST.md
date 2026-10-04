# Release checklist

A release is a separate maintainer decision. This checklist does not authorize or claim publication.

- [ ] Frozen install, lint, typecheck, all tests and all builds pass on the exact release commit.
- [ ] GitHub CI is green and deployment routes are verified.
- [ ] Review `pnpm audit` and document unresolved dependency/security risks.
- [ ] Changelog and README describe implemented behavior and known limitations.
- [ ] Package manifest, exported version and CLI --version agree for each package.
- [ ] Verify workspace dependencies become real version ranges in packed tarballs.
- [ ] Install tarballs in an isolated project and exercise the CLI and MCP stdio protocol.
- [ ] Verify all package exports, declarations, license files and executable paths are present.
- [ ] Review and rebuild the bundled Action; test its error/warning policy in a real workflow.
- [ ] Review the exact files in every tarball and Action artifact for secrets and unwanted content.
- [ ] Publish only after package ownership, provenance and credentials are established.
- [ ] Create release notes and tags only for artifacts actually released; never fabricate releases or contributor activity.
- [ ] Update install instructions only after testing installation from the public registry.

Apache 2.0 remains the license. Public issues and contribution readiness do not guarantee Drips acceptance. Keep the readiness report separate from release claims.
