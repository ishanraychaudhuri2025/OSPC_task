# WHY, PRACTICED — Deployment & Production Guide

An independent, non-commercial editorial learning experience inspired by publicly available ideas associated with Simon Sinek: purpose, the Golden Circle, leadership, trust, and the infinite mindset.

> **Independent Project Disclaimer:**  
> WHY, PRACTICED is an independent student project inspired by publicly available ideas from Simon Sinek. It is not affiliated with, endorsed by, or operated by Simon Sinek or The Optimism Company. Names and marks belong to their respective owners.

---

## 1. Production Architecture & Vercel Compatibility

| Component | AI Studio / Cloud Run Runtime | Vercel Deployment Runtime |
|---|---|---|
| **Frontend** | React 19 SPA compiled via Vite to `dist/` | Static Vite SPA deployed to Vercel CDN Edge |
| **Routing** | Handled via Express wildcard fallback to `dist/index.html` | Handled via `vercel.json` rewrite (`/(.*) -> /index.html`) |
| **API Endpoint** | `POST /api/newsletter` served by Express in `server.ts` | `POST /api/newsletter` executed as a Vercel Serverless Function (`api/newsletter.ts`) |
| **Authentication** | Client-side Firebase Auth SDK with `browserLocalPersistence` | Client-side Firebase Auth SDK with `browserLocalPersistence` |
| **Database** | Cloud Firestore instance `ai-studio-9a10e882-4e4e-4882-bc66-23bde83789c9` | Cloud Firestore instance `ai-studio-9a10e882-4e4e-4882-bc66-23bde83789c9` |

---

## 2. Environment Variables Configuration

| Variable Name | Exposure Level | Description | Where to Configure |
|---|---|---|---|
| `APP_URL` | Public / Hosting | Canonical URL of the deployed application | Vercel Project Settings > Environment Variables |
| `VITE_FIREBASE_API_KEY` | Public (Client) | Firebase Web API Key | Vercel Environment Variables (All Environments) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Public (Client) | Firebase Auth Domain (e.g. `*.firebaseapp.com`) | Vercel Environment Variables (All Environments) |
| `VITE_FIREBASE_PROJECT_ID` | Public (Client) | GCP Project ID (`gen-lang-client-0825093002`) | Vercel Environment Variables (All Environments) |
| `VITE_FIREBASE_STORAGE_BUCKET` | Public (Client) | Cloud Storage Bucket URL | Vercel Environment Variables (All Environments) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Public (Client) | FCM Sender ID | Vercel Environment Variables (All Environments) |
| `VITE_FIREBASE_APP_ID` | Public (Client) | Firebase Web App ID | Vercel Environment Variables (All Environments) |
| `VITE_FIREBASE_DATABASE_ID` | Public (Client) | Named Firestore Database ID (`ai-studio-9a10e882-4e4e-4882-bc66-23bde83789c9`) | Vercel Environment Variables (All Environments) |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | **Private (Server-Only)** | Service Account JSON string for Admin SDK | Vercel Environment Variables (Serverless Functions only) |
| `FIREBASE_PROJECT_ID` | **Private (Server-Only)** | Fallback Project ID for serverless function | Vercel Environment Variables (Serverless Functions only) |
| `FIREBASE_DATABASE_ID` | **Private (Server-Only)** | Fallback Database ID for serverless function | Vercel Environment Variables (Serverless Functions only) |

> **Security and configuration:**  
> Never commit service-account JSON, private keys, or real `.env` files. The generated `firebase-applet-config.json` is intentionally ignored by Git; configure `VITE_FIREBASE_*` values in the hosting environment instead. A Firebase web API key is public client configuration, not an Admin credential: restrict it to Firebase-related APIs only, and never reuse it for the Gemini Developer API. Server-only Admin credentials must never use the `VITE_` prefix.

---

## 3. Step-by-Step Vercel Deployment Checklist

### Step 1: Connect GitHub Repository
1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), select **Add New Project** and import the repository.
3. Keep the default build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Step 2: Configure Environment Variables in Vercel
In the project setup or **Project Settings > Environment Variables**, add the variables specified in `.env.example`:
- Set all `VITE_FIREBASE_*` variables for the frontend.
- Provide `FIREBASE_SERVICE_ACCOUNT_KEY` (or `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`) for serverless database operations.
- Ensure `VITE_FIREBASE_DATABASE_ID` and `FIREBASE_DATABASE_ID` are both set to `ai-studio-9a10e882-4e4e-4882-bc66-23bde83789c9`.

### Step 3: Authorize Domain in Firebase Console
Once Vercel assigns your domain (e.g., `why-practiced.vercel.app`):
1. Navigate to **Firebase Console > Authentication > Settings > Authorized domains**.
2. Click **Add domain** and enter your Vercel deployment hostname (`your-app.vercel.app`).
3. *(Required for Google Sign-In and email action redirect links to function without `auth/unauthorized-domain` errors).*

### Step 4: Verify Post-Deployment Flows
- [ ] Direct refresh on `/`, `/ideas`, `/practice`, `/podcast`, `/dashboard`, `/auth`, `/community`.
- [ ] Sign in with Google / Email and verify session persists after browser reload.
- [ ] Save, edit, and delete a Golden Circle purpose canvas in the Practice Lab.
- [ ] Bookmark a podcast episode and confirm it appears in the Dashboard.
- [ ] Test newsletter opt-in: submit invalid email (400), submit valid email (201), and submit duplicate email (200).

---

## 4. Local Development & Testing Commands

```bash
# 1. Install dependencies
npm install

# 2. Start local server with Express + Vite middleware
npm run dev
# Server accessible on http://localhost:3000

# 3. Typecheck codebase
npm run lint

# 4. Compile production bundle
npm run build

# 5. Start production Node server
npm run start
```
