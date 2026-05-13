import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Mail, Lock, User, AlertCircle, X } from "lucide-react";
import api, { setAuthTokens } from "@/utils/api";
import { useUIStore } from "@/store/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, setAuthModalTab } = useUIStore();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login State
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  // Signup State
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login/", loginData);
      const { access, refresh } = response.data || {};
      if (!access || !refresh) throw new Error("Missing tokens");
      
      setAuthTokens(access, refresh);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      closeAuthModal();
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/register/", signupData);
      setAuthModalTab("login");
      setError("");
      // Optionally auto-login or just show success
    } catch (err: any) {
      setError(err.response?.data?.detail || "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-background p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-2xl font-bold text-center">
              {authModalTab === "login" ? "Welcome back! 👋" : "Join Freshon 🌿"}
            </DialogTitle>
            <p className="text-center text-sm text-muted-foreground mt-1">
              {authModalTab === "login" 
                ? "Log in to continue your fresh journey." 
                : "Start your journey to healthier living today."}
            </p>
          </DialogHeader>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          {authModalTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="h-12 w-full rounded-2xl bg-surface pl-11 pr-4 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="h-12 w-full rounded-2xl bg-surface pl-11 pr-4 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-full bg-forest text-sm font-semibold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Username"
                  value={signupData.username}
                  onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                  className="h-12 w-full rounded-2xl bg-surface pl-11 pr-4 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  className="h-12 w-full rounded-2xl bg-surface pl-11 pr-4 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="h-12 w-full rounded-2xl bg-surface pl-11 pr-4 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  className="h-12 w-full rounded-2xl bg-surface pl-11 pr-4 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-full bg-forest text-sm font-semibold text-white shadow-md transition-all active:scale-95 disabled:opacity-50 mt-4"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setAuthModalTab(authModalTab === "login" ? "signup" : "login");
                setError("");
              }}
              className="text-sm text-muted-foreground"
            >
              {authModalTab === "login" ? (
                <>Don't have an account? <span className="font-bold text-forest hover:underline">Sign up</span></>
              ) : (
                <>Already have an account? <span className="font-bold text-forest hover:underline">Log in</span></>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
