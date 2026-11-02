const isProductionBuild = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

if (!isProductionBuild) {
  process.exit(0);
}

const requiredPublic = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_DATABASE_ID',
  'VITE_RECAPTCHA_ENTERPRISE_SITE_KEY',
];

const requiredServer = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_DATABASE_ID',
  'RECAPTCHA_ENTERPRISE_PROJECT_ID',
  'RECAPTCHA_ENTERPRISE_SITE_KEY',
  'RECAPTCHA_ENTERPRISE_SERVICE_ACCOUNT_KEY',
];

const missing = [...requiredPublic, ...requiredServer].filter((name) => !process.env[name]?.trim());
const hasFirebaseAdminJson = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim());
const hasFirebaseAdminSplit = Boolean(
  process.env.FIREBASE_CLIENT_EMAIL?.trim() && process.env.FIREBASE_PRIVATE_KEY?.trim()
);

if (!hasFirebaseAdminJson && !hasFirebaseAdminSplit) {
  missing.push('FIREBASE_SERVICE_ACCOUNT_KEY (or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)');
}

if (process.env.RECAPTCHA_ENTERPRISE_REQUIRED?.trim().toLowerCase() !== 'true') {
  missing.push('RECAPTCHA_ENTERPRISE_REQUIRED=true');
}

if (missing.length > 0) {
  const message = [
    'Production build blocked: required deployment configuration is missing.',
    'Add these variable names to the Vercel Production/Preview environment (values are never printed):',
    ...missing.map((name) => '- ' + name),
  ].join('\n');
  console.error(message);
  process.exit(1);
}
