import { useEffect, useState } from "react";
import { getLoans, updateLoanStatus, deleteLoan } from "../api/loans";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-blue-50 text-blue-700 border-blue-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
  rejected: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function LoanList() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  //only if admin have access on delet and other CRUDS
  const isAdmin = user?.role === "admin";

  function load() {
    getLoans().then((data) => setLoans(data.data));
  }

  useEffect(load, []);

  async function handleStatusChange(id, status) {
    await updateLoanStatus(id, status);
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this loan?")) return;
    await deleteLoan(id);
    load();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold text-slate-900 mb-6">

        {/* If admin proceed */}
        {isAdmin ? "All loans" : "Your loans"}
      </h1>

      <Link to="/dashboard" className="inline-block py-5 text-sm text-slate-600 hover:underline ">
          Back to dashboard →
      </Link>

      <div className="overflow-x-auto  rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              {isAdmin && <th className="px-4 py-2 font-medium">Borrower</th>}
              <th className="px-4 py-2 font-medium">Purpose</th>
              <th className="px-4 py-2 font-medium">Principal</th>
              <th className="px-4 py-2 font-medium">Total payable</th>
              <th className="px-4 py-2 font-medium">Status</th>
              {isAdmin && <th className="px-4 py-2 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loans.map((loan) => (
              <tr key={loan.id}>
                {isAdmin && <td className="px-4 py-2">{loan.user?.username}</td>}
                <td className="px-4 py-2">{loan.purpose}</td>
                <td className="px-4 py-2">${Number(loan.principal).toLocaleString()}</td>
                <td className="px-4 py-2">${Number(loan.total_payable).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[loan.status]}`}
                  >
                    {loan.status}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-2 space-x-2">
                    {loan.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(loan.id, "approved")}
                          className="text-green-700 hover:underline"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(loan.id, "rejected")}
                          className="text-red-700 hover:underline"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(loan.id)}
                      className="text-slate-400 hover:text-slate-700 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 6 : 4} className="px-4 py-8 text-center text-slate-400">
                  No loans yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
