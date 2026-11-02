# Deployment Guide

This guide configures a fresh deployment without sharing or committing credentials.

## 1. Prerequisites

- A GitHub account with access to this repository.
- A Firebase project with a web app and a named Cloud Firestore database.
- Google Cloud access to configure API-key restrictions and reCAPTCHA Enterprise.
- A Vercel project connected to this GitHub repository.
- Bun 1.4.4 and Node.js 22.12 or later for local development.

Install and run locally:

    bun install
    cp .env.example .env
    bun run dev

Fill in the local .env file with the values for your own Firebase and Google Cloud projects. Never commit the populated file.

Run the available checks:

    bun run lint
    bun run build

The repository currently has a known lockfile mismatch: package.json pins firebase-admin to 13.10.0, while the committed bun.lock records ^14.5.0. Regenerate and review the lockfile with the repository's pinned Bun version before relying on frozen/CI installs:

    bun install
    git diff -- package.json bun.lock

Keep the intentional firebase-admin version decision unless compatibility has been retested. Commit the regenerated bun.lock together with any intentional manifest change. Do not resolve this mismatch by silently upgrading the Admin SDK.

## 2. Configure Firebase

1. Create or select the Firebase project that will own this deployment.
2. Register a Firebase Web App and copy its public web configuration into the Vercel VITE_FIREBASE_* variables listed below.
3. Create or select the exact Cloud Firestore database used by the app. Use its exact database ID in both VITE_FIREBASE_DATABASE_ID and FIREBASE_DATABASE_ID.
4. Enable Email/Password authentication and Google authentication if both sign-in methods are required.
5. Add the production and approved preview hostnames that should support sign-in to Firebase Authentication's Authorized domains.
6. Review and deploy the rules in firestore.rules.

This repository includes firebase.json for the Firestore rules file. With the Firebase CLI authenticated and the correct project selected, deploy using:

    firebase deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID

The rules allow users to read and write only their own profile, canvases, and bookmarks. Browser access to newsletterSubscribers is denied; the server API uses the Admin SDK for that collection. Admin SDK calls bypass Firestore Security Rules, so server-side validation and least-privilege IAM permissions remain essential.

## 3. Restrict browser-facing Google configuration

Firebase web API keys, OAuth client IDs, and reCAPTCHA site keys are public client identifiers; they are not service-account secrets. Still:

- Restrict the Firebase API key to the Firebase-related APIs required by this app.
- Add HTTP referrer restrictions for the production and approved preview domains where compatible with Firebase's documented requirements.
- Do not add unrelated billable APIs or the Gemini Developer API to the public Firebase key.
- Use a separate, restricted key for any non-Firebase Google API.
- Configure reCAPTCHA Enterprise's site key for the exact production hostname(s).
- Register the App Check site key in Firebase Console before enforcing App Check. Monitor valid traffic before enabling enforcement for Authentication and Firestore.

Consult the [Firebase API-key guidance](https://firebase.google.com/docs/projects/api-keys) before changing restrictions; overly narrow restrictions can break sign-in or Firebase requests.

## 4. Configure reCAPTCHA Enterprise

The newsletter endpoint performs a server-side assessment in production and fails closed when its configuration is incomplete.

1. Create a score-based reCAPTCHA Enterprise key for the production hostname.
2. Set VITE_RECAPTCHA_ENTERPRISE_SITE_KEY for the browser and RECAPTCHA_ENTERPRISE_SITE_KEY to the same site-key value for the server.
3. Set RECAPTCHA_ENTERPRISE_PROJECT_ID to the Google Cloud project that owns the key.
4. Create a dedicated service account with only the permissions needed to create reCAPTCHA Enterprise assessments.
5. Store its JSON in RECAPTCHA_ENTERPRISE_SERVICE_ACCOUNT_KEY as a server-only Vercel variable.
6. Set RECAPTCHA_ENTERPRISE_REQUIRED=true in Vercel Production and Preview environments.
7. Start with a conservative RECAPTCHA_ENTERPRISE_MIN_SCORE (default 0.5), monitor false positives, and adjust deliberately.

Do not put the reCAPTCHA service-account JSON or private key in a VITE_* variable.

## 5. Configure Vercel

1. Import ishanraychaudhuri2025/OSPC_task into Vercel.
2. Set the framework preset to **Vite**.
3. Use bun install as the install command and bun run build as the build command.
4. Use dist as the output directory.
5. Add the environment variables below to the appropriate Vercel environments. Keep secrets server-side.
6. Redeploy after changing any build-time VITE_* variable.

### Public frontend variables

These values are embedded in the browser bundle and must contain no privileged credential:

| Variable | Required | Purpose |
| --- | --- | --- |
| VITE_FIREBASE_API_KEY | Yes | Firebase Web SDK project identifier |
| VITE_FIREBASE_AUTH_DOMAIN | Yes | Firebase Authentication domain |
| VITE_FIREBASE_PROJECT_ID | Yes | Firebase project ID |
| VITE_FIREBASE_STORAGE_BUCKET | Yes | Firebase Storage bucket |
| VITE_FIREBASE_MESSAGING_SENDER_ID | Yes | Firebase messaging sender ID |
| VITE_FIREBASE_APP_ID | Yes | Firebase web app ID |
| VITE_FIREBASE_DATABASE_ID | Yes | Exact Firestore database ID |
| VITE_RECAPTCHA_ENTERPRISE_SITE_KEY | Yes | Public newsletter reCAPTCHA site key |
| VITE_FIREBASE_APP_CHECK_RECAPTCHA_ENTERPRISE_KEY | Optional | Public App Check site key |

### Server-only variables

Never prefix these with VITE_. Configure them in Vercel's server environment variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| FIREBASE_SERVICE_ACCOUNT_KEY | One credential option | Firebase Admin service-account JSON |
| FIREBASE_CLIENT_EMAIL | Alternative credential option | Firebase Admin service-account email |
| FIREBASE_PRIVATE_KEY | Alternative credential option | Firebase Admin service-account private key |
| FIREBASE_PROJECT_ID | Yes | Explicit Admin SDK target project |
| FIREBASE_DATABASE_ID | Yes | Explicit Admin SDK target database |
| RECAPTCHA_ENTERPRISE_PROJECT_ID | Yes | Project owning the reCAPTCHA Enterprise key |
| RECAPTCHA_ENTERPRISE_SITE_KEY | Yes | Same public site key configured in the browser |
| RECAPTCHA_ENTERPRISE_SERVICE_ACCOUNT_KEY | Yes | Server-side service-account JSON for assessments |
| RECAPTCHA_ENTERPRISE_REQUIRED | Yes | Set to true for clarity; production enforces it regardless |
| RECAPTCHA_ENTERPRISE_MIN_SCORE | Recommended | Minimum score from 0.0 to 1.0 |

For Firebase Admin, provide either FIREBASE_SERVICE_ACCOUNT_KEY or both FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY. Also set the explicit project and database IDs. The backend no longer falls back to browser VITE_* values.

## 6. Production release checklist

- [ ] The committed bun.lock has been regenerated and matches package.json.
- [ ] bun run lint passes.
- [ ] bun run build passes with production environment variables.
- [ ] All required Vercel variables exist in the intended environment.
- [ ] Firebase API-key restrictions and allowed referrers have been reviewed.
- [ ] Firebase Authentication authorized domains are correct.
- [ ] Firestore rules have been deployed and tested with signed-in and signed-out users.
- [ ] Firebase App Check is registered; enforcement is enabled only after monitoring.
- [ ] reCAPTCHA Enterprise server assessment is configured and required.
- [ ] Admin service accounts have only the permissions they need.
- [ ] No private credential appears in the source, build output, logs, or screenshots.
- [ ] All routes load directly and survive refresh: /, /ideas, /practice, /podcast, /dashboard, /auth, and /community.
- [ ] GET /api/newsletter requires a valid Firebase bearer token.
- [ ] POST /api/newsletter rejects invalid input and fails closed when CAPTCHA is unavailable.
- [ ] Test one signup, duplicate signup, sign-in, canvas save/delete, and bookmark save/remove.
- [ ] Review Vercel function logs and Firebase usage after the first production release.

## 7. Operational notes

- The in-memory API rate limiter is best-effort per serverless instance. For stronger cross-instance protection, add a Vercel Firewall rate-limit rule or a shared distributed limiter.
- The production build checks that required Firebase and reCAPTCHA environment variables are present. It reports missing variable names only and never prints values.
- Vercel response headers are configured in vercel.json; the Express server applies the same baseline headers for local and self-hosted use.
- Never share .env, .vercel, Firebase service-account files, or Vercel environment exports.
