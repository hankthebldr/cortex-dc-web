# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to security@cortex-dc.com (or create a private security advisory on GitHub).

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

This information will help us triage your report more quickly.

## Preferred Languages

We prefer all communications to be in English.

## Security Update Policy

When we learn of a critical security issue, we will:

1. **Confirm the vulnerability** and determine affected versions
2. **Audit code** to find any similar problems
3. **Prepare patches** for all supported versions
4. **Release new versions** as soon as possible
5. **Publish a security advisory** on GitHub and notify affected users

## Security Best Practices for Contributors

### Authentication & Authorization
- Never commit credentials, API keys, or secrets to the repository
- Use environment variables for all sensitive configuration
- Implement proper RBAC (Role-Based Access Control) for all resources
- Use Workload Identity for GKE service account authentication

### Data Protection
- Encrypt all data in transit (TLS 1.3)
- Encrypt sensitive data at rest
- Never log sensitive information (passwords, tokens, PII)
- Implement proper input validation and sanitization

### Container Security
- Use minimal base images (distroless when possible)
- Run containers as non-root user
- Scan images for vulnerabilities before deployment
- Keep dependencies up to date

### Kubernetes Security
- Implement Pod Security Standards (restricted)
- Use Network Policies to limit pod-to-pod communication
- Enable RBAC and follow principle of least privilege
- Use secrets management (GCP Secret Manager)

### Code Security
- Enable strict TypeScript mode
- Use ESLint with security plugins
- Implement SAST (Static Application Security Testing)
- Run dependency vulnerability scans in CI
- Sign all commits with GPG

## Security Scanning

This project uses the following security tools:

- **Trivy**: Container image vulnerability scanning
- **Grype**: Additional vulnerability scanning
- **TruffleHog**: Secret detection in code and commits
- **npm audit**: Node.js dependency vulnerability scanning
- **SBOM**: Software Bill of Materials generation
- **ZAP**: DAST (Dynamic Application Security Testing)

## Compliance

This project aims to comply with:

- **OWASP Top 10**: Web application security risks
- **CIS Kubernetes Benchmark**: Container orchestration security
- **NIST Cybersecurity Framework**: Security posture management
- **SLSA Level 3**: Supply chain integrity

## Security-Related Configuration

### Environment Variables
Never commit files containing:
- `.env` files (except `.env.example`)
- Service account keys
- API tokens or passwords
- Encryption keys

### Secrets Management
- Use GCP Secret Manager for production secrets
- Use Kubernetes Secrets for cluster-level secrets
- Rotate secrets regularly (every 90 days minimum)
- Audit secret access logs

## Incident Response

In the event of a security incident:

1. **Immediate**: Contain the incident (disable affected services if needed)
2. **Within 1 hour**: Notify the security team
3. **Within 4 hours**: Assess impact and begin remediation
4. **Within 24 hours**: Implement fixes and deploy patches
5. **Within 7 days**: Conduct post-mortem and update security measures

## Contact

- **Security Team**: security@cortex-dc.com
- **Security Advisories**: https://github.com/your-org/cortex-dc-web/security/advisories
- **Bug Bounty**: (If applicable) Link to bug bounty program

---

Last updated: 2025-10-15
