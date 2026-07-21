import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <img src="/ssps-logo.svg" alt="SSPS Logo" className="h-14 mx-auto mb-4" />
        <div className="text-6xl font-black text-indigo-600 mb-2">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Page not found</h1>
        <p className="text-sm text-slate-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="block w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 transition mb-3"
        >
          Go back
        </button>
        <p className="text-sm text-slate-500">
          Have an account?{" "}
          <Link to="/login" className="font-semibold text-indigo-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
