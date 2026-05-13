import { motion } from "framer-motion";
import { useState } from "react";
import { formatISO } from "date-fns";
import { StepHeader } from "../freshon/StepHeader";
import { Icon } from "@/components/freshon/Icon";
import { useProfile, useUpdateProfile } from "@/hooks/useFarmer";
import { getApiErrorMessage } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const ConsentStep = ({ onNext, onBack }: Props) => {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const saveConsent = async () => {
    try {
      await updateProfile.mutateAsync({
        organic_pledge_accepted: true,
        organic_pledge_signature: signature.trim(),
        organic_pledge_accepted_at: formatISO(new Date()),
        bio: [profile?.bio?.replace(/\n?Organic pledge accepted by .*/g, ""), `Organic pledge accepted by ${signature.trim()}`].filter(Boolean).join("\n"),
      });
      onNext();
    } catch (error) {
      toast({
        title: "Consent not saved",
        description: getApiErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      key="consent"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="min-h-dvh md:min-h-[860px] flex flex-col"
    >
      <StepHeader current={5} total={6} onBack={onBack} label="Organic Consent" />

      <div className="px-7 pt-8 flex-1 flex flex-col">
        <div className="size-14 rounded-2xl bg-primary flex items-center justify-center mb-5 shadow-glow">
          <Icon name="gavel" className="text-secondary-deep text-2xl" filled weight={600} />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
          The Organic <span className="text-secondary">Oath</span>
        </h2>
        <p className="mt-2 text-foreground/60 font-medium">
          A solemn promise that defines our partnership.
        </p>

        {/* Document */}
        <div className="mt-6 relative rounded-[24px] bg-card border border-border p-6 shadow-soft">
          <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-secondary text-background text-[10px] font-bold uppercase tracking-wider">
            Affidavit
          </div>
          <p className="text-sm leading-relaxed text-foreground/85 font-medium text-pretty">
            I solemnly swear that I use only <span className="text-secondary font-bold">organic practices</span> in
            cultivating my farm produce. I will not use synthetic fertilizers, pesticides,
            herbicides, or genetically modified seeds. I commit to honest labeling and
            traceability of every harvest delivered to FreshOn customers.
          </p>
          <div className="mt-5 pt-5 border-t border-dashed border-border">
            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">
              Sign your name to confirm
            </p>
            <input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Type your full name"
              className="w-full bg-transparent outline-none text-2xl tracking-wide font-bold text-secondary-deep placeholder:text-foreground/25"
              style={{ fontFamily: "Outfit, cursive", fontStyle: "italic" }}
            />
            <div className="h-px bg-foreground/40 mt-1" />
          </div>
        </div>

        {/* Checkbox */}
        <button
          onClick={() => setAgreed((a) => !a)}
          className="mt-5 w-full glass rounded-2xl p-4 flex items-center gap-3 tap text-left"
        >
          <div
            className={`size-7 rounded-lg border-2 flex items-center justify-center transition-all ${
              agreed ? "bg-secondary border-secondary" : "border-secondary/40 bg-transparent"
            }`}
          >
            {agreed && <Icon name="check" className="text-background text-base" weight={700} />}
          </div>
          <p className="text-sm font-semibold text-foreground flex-1">
            I have read and accept the FreshOn organic pledge.
          </p>
        </button>

        <div className="flex-1 min-h-6" />

        <button
          onClick={saveConsent}
          disabled={!agreed || signature.trim().length < 3 || updateProfile.isPending}
          className="w-full h-16 rounded-full bg-gradient-forest text-background font-semibold text-base shadow-deep flex items-center justify-center gap-2 disabled:opacity-40 tap mt-8 mb-6"
        >
          {updateProfile.isPending ? "Saving..." : "I Solemnly Swear"}
          <Icon name="verified" weight={600} filled />
        </button>
      </div>
    </motion.div>
  );
};
