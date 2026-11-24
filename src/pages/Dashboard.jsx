import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../api/loans";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import api from '../api/axios';

const API_ROOT = `${import.meta.env.VITE_API_URL ?? ""}/api`;

export default function Dashboard() {
  const {user, logout} = useAuth();
  const [stats, setStats] = useState(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const notificationsRef = useRef(null);

  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState('');

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

async function load() {

   try {
    const { data } = await api.get(`${API_ROOT}/notifications`);
    setItems(data?.data?.data ?? []);
    setUnread(data?.unread_count ?? 0);
    setError("");
  } catch (err) {
    console.error(err);
    setError(
      err?.response?.data?.message ||
      "Could not load notifications."
    );
  } finally {
    setNotificationsLoading(false);
  }
}

useEffect(() => {
  let cancelled = false;

  api.get(`${API_ROOT}/notifications`)
    .then(({ data }) => {
      if (cancelled) return;

      setItems(data?.data?.data ?? []);
      setUnread(data?.unread_count ?? 0);
      setError("");
    })
    .catch((err) => {
      if (cancelled) return;

      console.error(err);
      setError(
        err?.response?.data?.message ||
        "Could not load notifications."
      );
    })
    .finally(() => {
      if (!cancelled) {
        setNotificationsLoading(false);
      }
    });

  return () => {
    cancelled = true;
  };
}, []);

useEffect(() => {
  function handlePointerDown(event) {
    if (
      notificationsRef.current &&
      !notificationsRef.current.contains(event.target)
    ) {
      setNotificationsOpen(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setNotificationsOpen(false);
    }
  }

  document.addEventListener("mousedown", handlePointerDown);
  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("mousedown", handlePointerDown);
    document.removeEventListener("keydown", handleKeyDown);
  };
}, []);


  async function markRead(id) { 
    await api.patch(`${API_ROOT}/notifications/${id}/read`); await load(); 
  }

  async function markAllRead() { 
    await api.patch(`${API_ROOT}/notifications/read-all`); await load(); 
  }


  return (

    <div className="min-h-screen bg-slate-50">
     
      <header className="border-b border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">
          Dashboard
        </h1>

        <div className="flex items-center gap-2">
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              aria-label={`Notifications, ${unread} unread`}
              aria-expanded={notificationsOpen}
            >
            <img
              src="/bell.png"
              alt=""
              className="h-5 w-5"
              aria-hidden="true"
            />

              {unread > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div
                role="dialog"
                aria-label="Notifications"
                className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Notifications
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {unread === 0
                        ? "No unread notifications"
                        : `${unread} unread`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={markAllRead}
                    disabled={!unread || notificationsLoading}
                    className="text-xs font-medium text-slate-700 disabled:text-slate-300"
                  >
                    Mark all read
                  </button>
                </div>

                {notificationsLoading ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    Loading notifications…
                  </div>
                ) : error ? (
                  <div
                    role="alert"
                    className="m-3 rounded-lg border border-red-100 bg-red-50 px-3 py-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                ) : items.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm font-medium text-slate-800">
                      You’re all caught up
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      New notifications will appear here.
                    </p>
                  </div>
                ) : (
                  <ul className="max-h-[26rem] overflow-y-auto">
                    {items.map((notification) => (
                      <li
                        key={notification.id}
                        className={`border-b border-slate-100 px-4 py-3 last:border-b-0 ${
                          notification.read_at
                            ? "bg-white"
                            : "bg-blue-50/60"
                        }`}
                      >
                        <p className="text-sm text-slate-800">
                          {notification.data?.message ?? "New notification"}
                        </p>

                        {!notification.read_at && (
                          <button
                            type="button"
                            onClick={() => markRead(notification.id)}
                            className="mt-2 text-xs font-medium text-blue-700"
                          >
                            Mark read
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <span className="hidden text-sm font-medium text-slate-700 sm:inline">
              {user?.username}
            </span>

            <button
              type="button"
              onClick={logout}
              className="rounded-md px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              Log out
            </button>
          </div>
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
