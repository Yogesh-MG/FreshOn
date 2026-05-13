import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { PhoneShell } from "@/components/freshon/PhoneShell";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { PhoneAuthStep } from "@/components/onboarding/PhoneAuthStep";
import { FounderStep } from "@/components/onboarding/FounderStep";
import { FarmProfileStep } from "@/components/onboarding/FarmProfileStep";
import { CropsStep } from "@/components/onboarding/CropsStep";
import { ConsentStep } from "@/components/onboarding/ConsentStep";
import { VerificationStep } from "@/components/onboarding/VerificationStep";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useFarmer";
import { AuthResponse } from "@/types/api";

type Stage =
  | "welcome"
  | "auth"
  | "founder"
  | "profile"
  | "crops"
  | "consent"
  | "verify"
  | "dashboard";

/** Onboarding-only stages (after auth, before dashboard) */
const ONBOARDING_ORDER: Stage[] = [
  "founder", "profile", "crops", "consent", "verify",
];

const ORDER: Stage[] = [
  "welcome", "auth", ...ONBOARDING_ORDER, "dashboard",
];

/**
 * Checks whether the farmer's profile is complete enough to skip onboarding.
 * Mirrors the backend logic: name + acreage + organic pledge accepted.
 */
const isProfileComplete = (profile?: {
  name?: string;
  total_acreage?: number;
  organic_pledge_accepted?: boolean;
} | null) => {
  return Boolean(
    profile?.name?.trim() &&
    profile?.total_acreage &&
    profile?.organic_pledge_accepted,
  );
};

const Index = () => {
  const { isAuthenticated } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const hasCheckedAuth = useRef(false);
  const [stage, setStage] = useState<Stage>("welcome");
  const [isInitialized, setIsInitialized] = useState(false);

  // On mount, check if user should skip onboarding
  useEffect(() => {
    // If we haven't checked auth yet and profile query finished loading
    if (hasCheckedAuth.current) return;
    
    // Wait for profile query to finish
    if (isAuthenticated && profileLoading) return;
    
    hasCheckedAuth.current = true;
    
    if (isAuthenticated && isProfileComplete(profile)) {
      // Existing user with completed profile → straight to dashboard
      setStage("dashboard");
    } else if (isAuthenticated && profile) {
      // Authenticated but incomplete profile → resume onboarding
      // Determine which step to resume at based on filled data
      if (!profile.name?.trim() || !profile.total_acreage) {
        setStage("profile");
      } else if (!profile.crops?.length) {
        setStage("crops");
      } else if (!profile.organic_pledge_accepted) {
        setStage("consent");
      } else {
        setStage("verify");
      }
    } else if (!isAuthenticated) {
      // User not logged in, show welcome
      setStage("welcome");
    }
    
    setIsInitialized(true);
  }, [isAuthenticated, profile, profileLoading]);

  const goNext = () => {
    const i = ORDER.indexOf(stage);
    if (i < ORDER.length - 1) setStage(ORDER[i + 1]);
  };
  const goBack = () => {
    const i = ORDER.indexOf(stage);
    if (i > 0) setStage(ORDER[i - 1]);
  };
  const reset = () => {
    hasCheckedAuth.current = false;
    setStage("welcome");
    setIsInitialized(false);
  };

  /**
   * Called after successful OTP verification.
   * Decides whether the user needs onboarding or can go straight to dashboard.
   */
  const handleAuth = useCallback((response: AuthResponse) => {
    if (!response.is_new_user && response.profile_complete) {
      // Returning user with completed profile → skip all onboarding
      setStage("dashboard");
    } else {
      // New user or incomplete profile → continue with onboarding
      goNext();
    }
  }, []);

  // Show loading while determining initial stage
  if (!isInitialized) {
    return (
      <PhoneShell>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-screen"
        >
          <div className="text-center">
            <div className="inline-block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full"
              />
            </div>
            <p className="mt-4 text-foreground/60">Loading...</p>
          </div>
        </motion.div>
      </PhoneShell>
    );
  }

  return (
    <>
      {/* SEO */}
      <title>FreshOn for Farmers — Premium organic farm-to-table</title>
      <meta
        name="description"
        content="FreshOn farmer app: onboard your organic farm, track sales, manage harvest, and get paid. Built for India's organic growers."
      />
      <link rel="canonical" href="/" />

      <PhoneShell>
        <AnimatePresence mode="wait">
          {stage === "welcome" && <WelcomeStep key="welcome" onNext={goNext} />}
          {stage === "auth" && (
            <PhoneAuthStep
              key="auth"
              onNext={goNext}
              onBack={goBack}
              onAuth={handleAuth}
            />
          )}
          {stage === "founder" && <FounderStep key="founder" onNext={goNext} onBack={goBack} />}
          {stage === "profile" && <FarmProfileStep key="profile" onNext={goNext} onBack={goBack} />}
          {stage === "crops" && <CropsStep key="crops" onNext={goNext} onBack={goBack} />}
          {stage === "consent" && <ConsentStep key="consent" onNext={goNext} onBack={goBack} />}
          {stage === "verify" && <VerificationStep key="verify" onComplete={goNext} onBack={goBack} />}
          {stage === "dashboard" && <Dashboard key="dashboard" onSignOut={reset} />}
        </AnimatePresence>
      </PhoneShell>
    </>
  );
};

export default Index;
