# WHY, PRACTICED

An independent, non-commercial editorial learning experience inspired by publicly available ideas associated with Simon Sinek: purpose, the Golden Circle, leadership, trust, and the infinite mindset.

> **Independent Project Disclaimer:**  
> WHY, PRACTICED is an independent student project inspired by publicly available ideas from Simon Sinek. It is not affiliated with, endorsed by, or operated by Simon Sinek or The Optimism Company. Names and marks belong to their respective owners.

---

## Features & Routes

1. **Editorial Homepage (`/`)**
   - High-craft typographic hierarchy inspired by publication design benchmarks.
   - Purpose statement, core premise quote, and three learning lenses: *Purpose*, *People & Trust*, and *Infinite Horizon*.
   - Featured topic previews linking to the curated catalog and community opt-in.

2. **Ideas Library (`/ideas`)**
   - 8 curated principles across **Purpose**, **Leadership**, **Trust & Teams**, and **Infinite Mindset**.
   - Interactive category filter with keyboard-accessible segmented buttons and an "All" reset.
   - Real-time search query filtering over titles, summaries, and reflection practices.
   - Clean unboxed metadata with typographic separators following zero-pill design discipline.
   - Outbound verified links to official primary sources:
     - [Simon Sinek Official Website](https://simonsinek.com/)
     - [Simon's Stated Purpose (Our WHY)](https://simonsinek.com/our-why/)
     - [Official Books Catalogue](https://simonsinek.com/books)
     - [Start with Why Reference](https://simonsinek.com/books/start-with-why)

3. **Notes on WHY Community (`/community`)**
   - Independent opt-in form with server-side schema validation and Firestore persistence.
   - Collects required email, optional first name, optional topic focus, and explicit consent.
   - Honeypot anti-spam protection (`website` hidden input).
   - Deterministic SHA-256 document IDs and atomic transaction deduplication.
   - Distinct, accessible states: Submitting, Success (201), Already Subscribed (200), Validation Error (400), and Server Error (500).

---

## Technical Architecture

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide icons.
- **Server:** Express.js running on Node.js.
- **Database:** Firebase Cloud Firestore (`newsletterSubscribers` collection) provisioned through Google AI Studio platform tools.
- **Security:**
  - Server-mediated writes; public client listing/querying forbidden (`allow list: if false`).
  - No secrets, credentials, or PII exposed to client bundles or public logs.
  - Rate limiting & input boundary sanitization (16kb JSON limit, 80-char name limit, 255-char email limit, RFC 5322 regex).

---

## Local Development & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000` with Express and Vite middleware.

### 3. Run Typecheck / Linting
```bash
npm run lint
```

### 4. Build for Production
```bash
npm run build
```

### 5. Start Production Server
```bash
npm run start
```

---

## Verification & QA

- Tested routes directly on direct refresh: `/`, `/ideas`, `/community`.
- Tested form submissions with valid email, duplicate email, invalid email format, and missing consent.
- Firestore security rules deployed and active (`firestore.rules`).
