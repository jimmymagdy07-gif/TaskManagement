const REQUIRED = ['DATABASE_URL', 'JWT_SECRET'];

export function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    console.error(
      `Missing required environment variable(s): ${missing.join(', ')}\n` +
        'Copy .env.example to .env in the project root and set real values.'
    );
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.warn(
      'Warning: JWT_SECRET should be at least 32 characters for production use.'
    );
  }
}
