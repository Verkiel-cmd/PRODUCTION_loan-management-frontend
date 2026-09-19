/**
 * =============================================================================
 *  axios CLIENT (frontend <-> Laravel API bridge)
 * =============================================================================
 *
 *  PURPOSE
 *  -------
 *  The single, centrally-configured HTTP client every page uses to talk to the
 *  Laravel backend. Two instances are exported:
 *    1. `api`     -> every JSON /api/* request (login, register, user, loans...).
 *    2. `sanctum` -> reserved for CSRF/bootstrap calls if Sanctum gets added
 *                    later; currently only used by auth.js helpers.
 *
 *  WHERE IT IS CONNECTED
 *  ---------------------
 *  - Points at the backend via `import.meta.env.VITE_API_URL` (see `.env` in
 *    this folder: `VITE_API_URL=http://localhost:8000`). The Laravel server is
 *    started with `php artisan serve` (default port 8000).
 *  - `baseURL: ${baseURL}/api` -> matches `routes/api.php` (all route prefixes
 *    are /api/*), so auth.js/loans.js call e.g. `api.post("/login")`.
 *  - `withCredentials: true`  -> REQUIRED for the cookie/session auth on the
 *    backend (see AuthController docblock). Without it the session cookie is
 *    not stored and every 401s.
 *
 *  WHERE IT IS CALLED
 *  ------------------
 *  - `../api/auth`  (jsx: AuthContext, Login, Register, Dashboard) -> uses `api`
 *    and `sanctum` for the auth endpoints.
 *  - `../api/loans` (jsx: Dashboard, LoanList, LoanForm)           -> uses `api`
 *    for the loans endpoints.
 *  - It is NOT called directly by any component; components always import the
 *    thin wrappers in auth.js / loans.js.
 *
 *  PATTERN
 *  -------
 *  Axios instance factory:
 *    - response interceptor: any 401 (expired/missing session) hard-redirects
 *      `window.location.href = "/login"` so protected pages kick you out cleanly
 *      (matches ProtectedRoute.jsx behaviour for client-side navigation too).
 *    - Otherwise errors are re-thrown untouched so call sites can read
 *      `err.response.data.message` / `err.response.data.errors`.
 * =============================================================================
 */

import axios from "axios";

// Backend root from .env. Keep in sync with `php artisan serve` origin.
const baseURL = import.meta.env.VITE_API_URL;

// Reserved for Sanctum-style CSRF bootstrap. Not called today, but kept wired
// so the auth flow can fetch a CSRF cookie without further plumbing.
export const sanctum = axios.create({
  baseURL,
  withCredentials: true,
});

// Main JSON API client — points at the /api prefix of the Laravel routes.
const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// Single global place to handle "not authenticated". 401s from any endpoint
// bounce to /login (AuthContext also nulls the user on its own /api/user call).
api.interceptors.response.use(
  (response) => response,
  (error) => {
   if (error.response?.status === 401 && !["/login", "/register"].includes(window.location.pathname)) {
  window.location.href = "/login";
}
    return Promise.reject(error);
  }
);

export default api;