import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await signup(fullName, email, password);
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">
            Create your account
        </h1>
        <p className="mb-6 text-sm font-bold text-slate-500">
            Plan better, study smarter
        </p>
        {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
        <label className="mb-1 block text-sm font-bold text-slate-700">Full name</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
          className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
        <label className="mb-1 block text-sm font-bold text-slate-700">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
        <label className="mb-1 block text-sm font-bold text-slate-700">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="mb-6 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Creating…" : "Create account"}
        </button>
        <p className="mt-5 font-bold text text-center text-sm text-slate-500">
          Have an account? <Link to="/login" className="font-semibold text-indigo-600">Sign in</Link>
        </p>
      </form>
    </div>
  );
}