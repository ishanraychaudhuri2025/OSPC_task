# Security Policy

## Reporting a vulnerability

Please do not publish exploit details, credentials, personal data, or an unpatched vulnerability in a public issue.

Use GitHub's **Security → Advisories → Report a vulnerability** flow to send a private report when private vulnerability reporting is enabled for this repository. Repository maintainers should enable it in **Settings → Code security and analysis → Private vulnerability reporting**.

Include the affected file or endpoint, impact, reproduction steps, and a proposed mitigation where possible. Do not include live credentials in the report.

## Credential handling

Never commit any of the following:

- Firebase Admin service-account JSON or private keys.
- Google Cloud service-account private keys used for reCAPTCHA Enterprise.
- Vercel tokens, GitHub tokens, OAuth client secrets, signing secrets, or session secrets.
- Database passwords, private certificates, or production environment files.

Use Vercel Project Environment Variables for deployment secrets and a local, ignored .env file for development. The committed .env.example and vercel.env.example files must contain variable names and safe defaults only.

### Public browser configuration is different

Firebase web configuration values (including a Firebase web API key), OAuth client IDs, and reCAPTCHA **site** keys are browser identifiers and are expected to be visible to users. They are not substitutes for authorization. Restrict Google API keys to the required APIs and appropriate referrers, enforce Firebase Authentication and Firestore Security Rules, and configure Firebase App Check where supported.

Never expose service-account private keys or other privileged credentials through a VITE_* variable. Vite embeds VITE_* values in the browser bundle.

## If a credential is exposed

1. Revoke or rotate the credential at its issuing provider immediately.
2. Review provider audit logs and usage for unexpected activity.
3. Replace the credential in Vercel and local environments.
4. Redeploy affected environments.
5. Remove the exposed value from the current source tree.
6. Assess Git history, tags, branches, forks, build logs, and deployment artifacts. A normal commit that deletes a secret does not remove it from Git history.
7. Rewrite history only when an actual secret has been exposed and after coordinating with all collaborators; force-pushing rewritten history can disrupt clones and open pull requests.

Do not paste credentials into issues, pull requests, chat, or screenshots.

## Security controls in this repository

- Firestore uses owner-scoped access rules and denies direct browser access to newsletter subscriber records.
- Newsletter writes use a server-side Firebase Admin adapter and server-side reCAPTCHA Enterprise assessment in production.
- Server-side Firebase project and database targets must be configured explicitly.
- Production responses include baseline browser security headers.
- Secret scanning and dependency review run through GitHub Actions.

These controls reduce risk but do not replace provider-side configuration, monitoring, or periodic review.
