# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Stellar DevKit, please report it responsibly.

**Please DO NOT open a public GitHub issue.**

Instead, please email security reports to: [security@stellar-devkit.dev](mailto:security@stellar-devkit.dev)

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

We will respond within 48 hours and work with you to understand and address the issue.

## Security Best Practices

Stellar DevKit follows these security principles:

- **No private key handling** - We never request, store, or log private keys or seed phrases
- **Input validation** - All user inputs are validated and sanitized
- **Dependency scanning** - Regular security audits of dependencies
- **Read-only operations** - Phase 1 tools are read-only by design
- **Rate limiting** - RPC requests are rate-limited to prevent abuse

## Known Limitations

- Phase 1 is read-only and does not support transaction signing
- RPC endpoints may have their own rate limits
- Historical data is limited by Stellar RPC retention (~7 days)

## Security Updates

Security updates will be released as patch versions and announced via:
- GitHub Security Advisories
- Release notes
- Project README

## Acknowledgments

We appreciate security researchers who responsibly disclose vulnerabilities.
