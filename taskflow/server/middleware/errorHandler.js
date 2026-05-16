const PG_HINTS = {
  '3D000': 'Database does not exist. Run: cd server && npm run db:init',
  '42P01': 'Tables are missing. Run: cd server && npm run db:init',
  '28P01': 'PostgreSQL rejected the username or password. Check DATABASE_URL in .env',
  'ECONNREFUSED': 'Cannot reach PostgreSQL. Is the server running?',
};

export function notFound(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);

  const hint = PG_HINTS[err.code];
  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : hint || err.message || 'Internal server error';

  res.status(status).json({
    message,
    ...(hint && process.env.NODE_ENV !== 'production' ? { code: err.code } : {}),
  });
}
