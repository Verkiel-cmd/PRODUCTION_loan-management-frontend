import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import axios from "axios";

export default function Register() {

  const { setUser } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL ?? "";

  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
    const { data } = await axios.post(`${API_URL}/api/register`, {
        username: form.username,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      },
      { withCredentials: true }
    );

      setUser(data.user);          // so Dashboard/ProtectedRoute know who you are
      navigate("/dashboard");
    } catch (err) {
      const messages = err.response?.data?.errors;
      setError(messages ? Object.values(messages).flat().join(" ") : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Create account</h1>
        <p className="text-sm text-slate-500 mb-6">Set up your account to get started.</p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "username", label: "Username", type: "text" },
            { key: "email", label: "Email", type: "email" },
            { key: "password", label: "Password", type: "password" },
            { key: "password_confirmation", label: "Confirm password", type: "password" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-slate-900 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
