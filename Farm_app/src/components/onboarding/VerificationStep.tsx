import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useUploadMedia } from "@/hooks/useFarmer";
import { getApiErrorMessage } from "@/services/api";
import { BloomSuccess } from "../freshon/BloomSuccess";
import { Icon } from "@/components/freshon/Icon";
import { StepHeader } from "../freshon/StepHeader";

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

type UploadState = "idle" | "uploaded";

export const VerificationStep = ({ onComplete, onBack }: Props) => {
  const [walk, setWalk] = useState<UploadState>("idle");
  const [closeup, setCloseup] = useState<UploadState>("idle");
  const [walkFile, setWalkFile] = useState<File | null>(null);
  const [closeupFile, setCloseupFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const walkInput = useRef<HTMLInputElement>(null);
  const closeupInput = useRef<HTMLInputElement>(null);
  const uploadMedia = useUploadMedia();

  const submit = async () => {
    if (!walkFile || !closeupFile) return;
    setSubmitting(true);
    try {
      await uploadMedia.mutateAsync({ file: walkFile, type: "farm_video" });
      await uploadMedia.mutateAsync({ file: closeupFile, type: "product_video" });
      setTimeout(onComplete, 900);
    } catch (error) {
      setSubmitting(false);
      toast({
        title: "Verification not uploaded",
        description: getApiErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    }
  };

  if (submitting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-dvh md:min-h-[860px] flex flex-col items-center justify-center px-8 text-center"
      >
        <BloomSuccess label="Welcome to FreshOn" />
        <p className="mt-4 text-foreground/60 font-medium max-w-[28ch]">
          Your farm is being verified. Taking you to your dashboard...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="verify"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="min-h-dvh md:min-h-[860px] flex flex-col"
    >
      <StepHeader current={6} total={6} onBack={onBack} label="Verification" />

      <div className="px-7 pt-8 flex-1 flex flex-col">
        <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
          Show us your <span className="text-secondary">farm</span>
        </h2>
        <p className="mt-2 text-foreground/60 font-medium">
          Two short videos help our team verify your authenticity.
        </p>

        <input
          ref={walkInput}
          type="file"
          accept="video/*"
          capture="environment"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setWalkFile(file);
            setWalk("uploaded");
          }}
        />
        <input
          ref={closeupInput}
          type="file"
          accept="video/*"
          capture="environment"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setCloseupFile(file);
            setCloseup("uploaded");
          }}
        />

        <div className="mt-7 space-y-4">
          <RecordTile
            icon="videocam"
            title="Farm walk-through"
            sub={walkFile?.name || "60-90s wide tour of your fields"}
            state={walk}
            onAction={() => walkInput.current?.click()}
          />
          <RecordTile
            icon="center_focus_strong"
            title="Product close-up"
            sub={closeupFile?.name || "30s close shots of your produce"}
            state={closeup}
            onAction={() => closeupInput.current?.click()}
          />
        </div>

        <div className="mt-6 glass rounded-2xl p-4 flex gap-3">
          <Icon name="lightbulb" className="text-primary text-lg" filled />
          <p className="text-xs leading-relaxed font-medium text-foreground/75">
            Tip: Film in daylight, hold steady, and show real workers and crops on the farm.
          </p>
        </div>

        <div className="flex-1 min-h-6" />

        <button
          onClick={submit}
          disabled={walk !== "uploaded" || closeup !== "uploaded" || uploadMedia.isPending}
          className="w-full h-16 rounded-full bg-gradient-forest text-background font-semibold text-base shadow-deep flex items-center justify-center gap-2 disabled:opacity-40 tap mt-8 mb-6"
        >
          {uploadMedia.isPending ? "Uploading..." : "Submit for Verification"}
          <Icon name="check_circle" weight={600} filled />
        </button>
      </div>
    </motion.div>
  );
};

const RecordTile = ({
  icon,
  title,
  sub,
  state,
  onAction,
}: {
  icon: string;
  title: string;
  sub: string;
  state: UploadState;
  onAction: () => void;
}) => {
  const isUploaded = state === "uploaded";
  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      className={`rounded-[24px] p-5 border-2 transition-all ${isUploaded ? "bg-secondary/8 border-secondary/40" : "glass border-transparent"}`}
    >
      <div className="flex items-center gap-4">
        <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 ${isUploaded ? "bg-secondary text-background" : "bg-primary/15 text-secondary"}`}>
          <Icon name={isUploaded ? "check" : icon} className="text-2xl" filled weight={600} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground">{title}</p>
          <p className="text-xs text-foreground/60 font-medium truncate">{sub}</p>
        </div>
        <button
          onClick={onAction}
          className={`size-12 rounded-full flex items-center justify-center tap shrink-0 ${isUploaded ? "bg-background border border-secondary/30 text-secondary" : "bg-secondary text-background"}`}
        >
          <Icon name={isUploaded ? "refresh" : "file_upload"} className="text-xl" filled weight={600} />
        </button>
      </div>
    </motion.div>
  );
};
