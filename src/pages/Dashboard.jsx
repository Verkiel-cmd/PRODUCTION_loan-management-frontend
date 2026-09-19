import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../api/loans";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => setStats(null));
  }, []);

  const cards = stats
    ? [
        { label: "Total loans", value: stats.total_loans },
        { label: "Active", value: stats.active_loans },
        { label: "Paid off", value: stats.paid_loans },
        { label: "Overdue", value: stats.overdue_loans },
        { label: "Disbursed", value: `$${Number(stats.total_disbursed).toLocaleString()}` },
        { label: "Collected", value: `$${Number(stats.total_collected).toLocaleString()}` },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{user?.name}</span>
            <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-900">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {cards.map((card) => (
            <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Loans</h2>
          <Link
            to="/loans/new"
            className="rounded-md bg-slate-900 text-white text-sm font-medium px-3 py-1.5 hover:bg-slate-800"
          >
            New loan application
          </Link>
        </div>

        <Link to="/loans" className="text-sm text-slate-600 hover:underline">
          View all loans →
        </Link>
      </main>
    </div>
  );
}
