import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Mail, Lock, User, AlertCircle } from "lucide-react";
import api from "@/utils/api";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // In our simple backend, we use register endpoint if available, 
      // or just hit the accounts create endpoint.
      await api.post("/api/auth/register/", formData);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Could not create account. Try a different username.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pt-12">
      <Link to="/welcome" className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>

      <div className="flex-1 pb-10">
        <h1 className="font-display text-3xl font-bold">Join Freshon 🌿</h1>
        <p className="mt-2 text-sm text-muted-foreground">Start your journey to healthier living today.</p>

        <form onSubmit={handleSignup} className="mt-8 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="h-14 w-full rounded-2xl bg-surface pl-11 pr-4 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-14 w-full rounded-2xl bg-surface pl-11 pr-4 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="h-14 w-full rounded-2xl bg-surface pl-11 pr-4 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="h-14 w-full rounded-2xl bg-surface pl-11 pr-4 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center rounded-full bg-forest text-sm font-semibold text-forest-foreground shadow-soft transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="font-bold text-forest underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
