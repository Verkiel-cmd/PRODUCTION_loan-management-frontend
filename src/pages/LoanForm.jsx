import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { createLoan } from "../api/loans";

export default function LoanForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    purpose: "",
    principal: "",
    interest_rate: "",
    duration_months: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Live preview so the borrower sees the cost before submitting —
  // mirrors the same formula the backend uses (kept in sync manually).
const preview = useMemo(() => {
    const p = parseFloat(form.principal);
    const r = parseFloat(form.interest_rate);
    const m = parseInt(form.duration_months);
    if (!p || !r || !m) return null;

    const interest = p * (r / 100) * (m / 12);
    return {
      interest: interest.toFixed(2),
      totalPayable: (p + interest).toFixed(2),
    };
  }, [form]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const p = parseFloat(form.principal);
    const r = parseFloat(form.interest_rate);
    const m = parseInt(form.duration_months);

    if (!p || p <= 0 || p > 99999999) {
      setError("Principal must be between 1 and $99,999,999.");
      return;
    }
    if (r === null || r === undefined || isNaN(r) || r < 0 || r > 100) {
      setError("Interest rate must be between 0 and 100%.");
      return;
    }
    if (!m || m < 1 || m > 600) {
      setError("Duration must be between 1 and 600 months.");
      return;
    }

    setLoading(true);
    try {
      // CALLED FUNCTION FROM import { createLoan } from "../api/loans";
      await createLoan({
        ...form,
        principal: p,
        interest_rate: r,
        duration_months: m,
      });
      navigate("/loans");
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit application.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold text-slate-900 mb-2">Apply for a loan</h1>

      <Link to="/dashboard" className="block py-2 text-sm text-slate-600 hover:underline text-right">
          Back to dashboard →
      </Link>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Purpose</label>
          <input
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Principal amount ($)</label>
          <input
            type="number"
            min="1"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={form.principal}
            onChange={(e) => setForm({ ...form, principal: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Annual interest rate (%)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={form.interest_rate}
            onChange={(e) => setForm({ ...form, interest_rate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Duration (months)</label>
          <input
            type="number"
            min="1"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={form.duration_months}
            onChange={(e) => setForm({ ...form, duration_months: e.target.value })}
          />
        </div>

        {preview && (
          <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-600">
            <p>Interest: ${preview.interest}</p>
            <p>Total payable: ${preview.totalPayable}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit application"}
        </button>
      </form>
    </div>
  );
}
