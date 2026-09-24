/**
 * =============================================================================
 *  AUTH API WRAPPER
 * =============================================================================
 *
 *  PURPOSE
 *  -------
 *  Thin, named functions for every backend authentication endpoint in
 *  `routes/api.php` (AuthController). Components never touch axios directly —
 *  they call these and get the decoded payload back.
 *
 *  WHAT EACH FUNCTION RETURNS (contract with the pages)
 *  ----------------------------------------------------
 *  - login(email, password)   -> { user }           (AuthController::login)
 *  - register(...)            -> { user }           (AuthController::register)
 *  - logout()                 -> undefined (204)    (AuthController::logout)
 *  - getCurrentUser()         -> user object        (AuthController::user)
 *
 *  WHERE IT IS CONNECTED
 *  ---------------------
 *  - Backend routes (see routes/api.php): POST /api/login, /register, /logout,
 *    GET /api/user, plus forgot/verify/reset-password helpers.
 *  - HTTP handled by the shared instance `api` from `./axios` (includes the
 *    `withCredentials` cookie handling + 401 redirect).
 *
 *  WHERE IT IS CALLED
 *  ------------------
 *  - AuthContext.jsx : `login`, `logout`, `getCurrentUser` (session restore
 *    on app boot).
 *  - Login.jsx       : `login(form.email, form.password)`.
 *  - Register.jsx    : `register(name, email, password, password_confirmation)`.
 *
 *  PATTERN
 *  -------
 *  1) Named export per endpoint.
 *  2) Params passed positionally, not as option bags — keeps call sites terse.
 *  3) Errors are Prop (they propagate to the caller; pages read
 *     `err.response?.data?.message | errors`).
 * =============================================================================
 */
import api, { API_ROOT } from "./axios";
/**
 * POST /api/login  -> logs in and stores the Laravel session cookie.
 */
export async function login(username, email, password) {
  const { data } = await api.post(`${API_ROOT}/login`, {
     username, 
     email, 
     password });
  return data.user;
}

/**
 * POST /api/register -> creates the account (role 'user') and logs it in.
 */
export async function register(username, email, password, passwordConfirmation) {
  const { data } = await api.post(`${API_ROOT}/register`, {
    username,
    email,
    password,
    password_confirmation: passwordConfirmation,
  });
  return data.user;
}

/**
 * POST /api/logout -> destroys the backend session. Returns nothing (204).
 */
export async function logout() { await api.post(`${API_ROOT}/logout`); 
}


/**
 * GET /api/user -> current session's user, or a 401 (caught by AuthContext).
 */
export async function getCurrentUser() {
  const { data } = await api.get(`${API_ROOT}/user`);
  return data;
}

/**
 * POST /api/forgot-password -> placeholder OTP request.
 */
export async function forgotPassword(email) {
  const { data } = await api.post(`${API_ROOT}/forgot-password`, { email });
  return data;
}

/**
 * POST /api/verify-otp -> placeholder OTP check.
 */
export async function verifyOtp(email, otp) {
  const { data } = await api.post(`${API_ROOT}/verify-otp`, { email, otp });
  return data;
}

/**
 * POST /api/reset-password -> sets a new password.
 */
export async function resetPassword(email, password, passwordConfirmation) {
  const { data } = await api.post(`${API_ROOT}/reset-password`, {
    email,
    password,
    password_confirmation: passwordConfirmation,
  });
  return data;
}