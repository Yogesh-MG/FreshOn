import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Mail, Lock, AlertCircle } from "lucide-react";
import api, { setAuthTokens } from "@/utils/api";

const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login/", { username, password });
      const { access, refresh } = response.data || {};

      if (!access || !refresh) {
        throw new Error("Login response did not include access and refresh tokens");
      }

      setAuthTokens(access, refresh);

      // Invalidate the cached "me" query so PrivateRoute re-fetches
      // the fresh user with the new access token.
      await queryClient.invalidateQueries({ queryKey: ["me"] });

      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pt-12">
      <Link to="/welcome" className="mb-10 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>

      <div className="flex-1">
        <h1 className="font-display text-3xl font-bold">Welcome back! 👋</h1>
        <p className="mt-2 text-sm text-muted-foreground">Log in to continue your fresh journey.</p>

        <form onSubmit={handleLogin} className="mt-10 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-14 w-full rounded-2xl bg-surface pl-11 pr-4 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 w-full rounded-2xl bg-surface pl-11 pr-4 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center rounded-full bg-forest text-sm font-semibold text-forest-foreground shadow-soft transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/signup" className="font-bold text-forest underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
