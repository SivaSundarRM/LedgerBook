import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NotebookPen, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-ink-900 text-moss-300">
            <NotebookPen size={20} />
          </div>
          <h1 className="font-mono text-lg font-semibold text-ink-900">Ledger</h1>
          <p className="mt-1 text-sm text-ink-400">Log in to manage your loans</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="field-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="field-input"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="field-input"
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md bg-rust-500/10 px-3 py-2.5 text-sm text-rust-600">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Logging in…" : "Log in"}
            </button>
          </form>

          <div className="mt-4 rounded-md border border-dashed border-ink-200 px-3 py-2.5 text-xs text-ink-400">
            Demo login: <span className="tabular font-medium text-ink-600">demo@demo.com</span> /{" "}
            <span className="tabular font-medium text-ink-600">demo1234</span>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-ink-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-moss-500 hover:text-moss-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
