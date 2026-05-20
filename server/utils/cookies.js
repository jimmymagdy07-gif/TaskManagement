const COOKIE_NAME = 'token';

export function getCookieOptions() {
  const maxAge = parseMaxAge(process.env.JWT_EXPIRES_IN || '7d');

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge,
    path: '/',
  };
}

function parseMaxAge(expiresIn) {
  const match = /^(\d+)([dhms])$/.exec(expiresIn);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
  return value * multipliers[unit];
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
}

export { COOKIE_NAME };
