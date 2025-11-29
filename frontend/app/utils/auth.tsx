// app/utils/auth.js
// Simple token storage helpers and API calls (login/register/logout)

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "authUser";

/* Token storage helpers */
export const saveTokens = ({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) => {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

/* Access token helpers */
export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

/* User */
export const saveUser = (user: { name: string; email: string; role: string }) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
export const getUser = () => {
  const str = localStorage.getItem(USER_KEY);
  return str ? JSON.parse(str) : null;
};
