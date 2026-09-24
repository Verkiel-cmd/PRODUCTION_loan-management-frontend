/**
 * =============================================================================
 *  LOANS API WRAPPER
 * =============================================================================
 *
 *  PURPOSE
 *  -------
 *  Named functions for every backend loan endpoint in `routes/api.php`
 *  (LoanController): list, create, detail, status change, repayment, delete,
 *  and the dashboard stats.
 *
 *  RETURN SHAPES (contract with the pages)
 *  ---------------------------------------
 *  - getLoans()            -> paginator { data: Loan[], links, meta }
 *                             LoanList.jsx uses `data.data` (the array).
 *  - createLoan(input)     -> the created Loan (201).
 *  - getDashboardStats()   -> { total_loans, active_loans, paid_loans,
 *                               overdue_loans, total_disbursed, total_collected }
 *                             Dashboard.jsx reads exactly these keys.
 *  - updateLoanStatus(id)  -> the updated Loan (with total_payable appended).
 *  - deleteLoan(id)        -> undefined (204).
 *
 *  LOAN OBJECT SHAPE (what you can read off any returned loan)
 *  -----------------------------------------------------------
 *  id, user_id, purpose, principal, interest_rate, duration_months, status,
 *  created_at, updated_at, total_payable (computed on the backend model),
 *  plus `user: {id,name,email,...}` when loaded (index/show eager-load it).
 *
 *  WHERE IT IS CONNECTED
 *  ---------------------
 *  - Backend routes (routes/api.php): /api/loans, /api/loans/{id},
 *    /api/loans/{id}/status, /api/loans/{id}/repayments, /api/loans/stats.
 *  - HTTP handled by the shared `api` instance from `./axios` (credentials +
 *    401 redirect).
 *
 *  WHERE IT IS CALLED
 *  ------------------
 *  - Dashboard.jsx : getDashboardStats() (stat cards on mount).
 *  - LoanList.jsx  : getLoans(), updateLoanStatus(id, status), deleteLoan(id).
 *  - LoanForm.jsx  : createLoan({ purpose, principal, interest_rate,
 *                               duration_months }) on submit.
 *  addRepayment() is wired for the loan detail flow but no page binds to it yet.
 *
 *  PATTERN
 *  -------
 *  Same as auth.js: one named export per endpoint, positional params, payloads
 *  are returned decoded (`data`), errors propagate to the calling page.
 * =============================================================================
 */
import api, { API_ROOT } from "./axios";

/**
 * GET /api/loans -> paginated loan list (admin: all; borrower: own only).
 */
export async function getLoans() {
  const { data } = await api.get(`${API_ROOT}/loans`); 
  return data; 
}

/**
 * POST /api/loans -> create a loan application (status starts 'pending').
 * Input keys MUST match LoanForm.jsx: purpose, principal, interest_rate,
 * duration_months.
 */
export async function createLoan(input) {
  const { data } = await api.post(`${API_ROOT}/loans`, input); 
  return data; 
}

/**
 * PATCH /api/loans/{id}/status -> update loan status (admin only).
 */
export async function updateLoanStatus(id, status) {
  const { data } = await api.patch(`${API_ROOT}/loans/${id}/status`, { status });
  return data;
}

/**
 * DELETE /api/loans/{id} -> delete a loan. Returns nothing (204).
 */
export async function deleteLoan(id) {
  await api.delete(`${API_ROOT}/loans/${id}`); 
}


/**
 * GET /api/loans/stats -> the six dashboard stat cards.
 */
export async function getDashboardStats() {
  const { data } = await api.get(`${API_ROOT}/loans/stats`);
  return data;
}

/**
 * GET /api/loans/{id} -> single loan + its repayments (detail page).
 */
export async function getLoan(id) {
  const { data } = await api.get(`${API_ROOT}/loans/${id}`);
  return data;
}


/**
 * POST /api/loans/{id}/repayments -> record an installment (detail flow).
 */
export async function addRepayment(id, input) {
  const { data } = await api.post(`${API_ROOT}/loans/${id}/repayments`, input);
  return data;
}