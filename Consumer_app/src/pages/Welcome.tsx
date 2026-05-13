import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, Leaf } from "lucide-react";

const Welcome = () => {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-forest text-forest-foreground relative overflow-hidden flex flex-col">
      {/* Soft blurs */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-mint/30 blur-3xl" />
      <div className="absolute bottom-20 -right-20 h-72 w-72 rounded-full bg-harvest/30 blur-3xl" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-3"
        >
          <div className="text-6xl mb-3">🌿</div>
          <h1 className="font-display font-extrabold text-5xl tracking-tight">
            FreshOn<span className="text-mint">.in</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-serif italic text-2xl mt-4 text-balance"
        >
          Harvested Today.<br />
          Delivered in <span className="text-mint not-italic font-display font-bold">12 min.</span>
        </motion.p>
        <p className="mt-3 text-forest-foreground/80 text-sm">Direct from local farmers to your kitchen</p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {[
            { icon: Zap, label: "Ultra-Fast" },
            { icon: ShieldCheck, label: "Pesticide Free" },
            { icon: Leaf, label: "Traceable" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 text-xs font-medium">
              <Icon className="h-3.5 w-3.5" /> {label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 px-6 pb-10 space-y-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => nav("/login")}
          className="w-full bg-mint text-mint-foreground rounded-full py-4 text-base font-semibold shadow-lg"
        >
          Get Started →
        </motion.button>
        <p className="text-xs text-center text-forest-foreground/70">
          By continuing, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Welcome;
