import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StepHeader } from "../freshon/StepHeader";
import { Icon } from "@/components/freshon/Icon";
import { useUpdateProfile, useUploadMedia } from "@/hooks/useFarmer";
import { toast } from "@/hooks/use-toast";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const FarmProfileStep = ({ onNext, onBack }: Props) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [acres, setAcres] = useState("");
  const [location, setLocation] = useState(t("onboarding.tapToPick"));
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const updateProfile = useUpdateProfile();
  const uploadMedia = useUploadMedia();

  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file));
    }
  };

  const pickLocation = () => {
    setLocation("Whitefield, Bengaluru, KA");
  };

  const saveProfile = async () => {
    if (!name || !acres) return;

    try {
      if (avatarFile) {
        await uploadMedia.mutateAsync({ file: avatarFile, type: "profile_photo" });
      }

      await updateProfile.mutateAsync({
        name,
        farm_name: `${name}'s Farm`,
        location: location === t("onboarding.tapToPick") ? "" : location,
        total_acreage: Number(acres),
      });
      onNext();
    } catch (error) {
      toast({
        title: t("onboarding.profileNotSaved"),
        description: t("common.tryAgain"),
        variant: "destructive",
      });
    }
  };

  const isSaving = updateProfile.isPending || uploadMedia.isPending;

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="min-h-dvh md:min-h-[860px] flex flex-col"
    >
      <StepHeader current={3} total={6} onBack={onBack} label={t("onboarding.farmProfile")} />

      <div className="px-7 pt-8 flex-1 flex flex-col">
        <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
          {t("onboarding.tellUs")} <span className="text-secondary">{t("onboarding.yourLand")}</span>
        </h2>
        <p className="mt-2 text-foreground/60 font-medium">
          {t("onboarding.discover")}
        </p>

        {/* Avatar */}
        <div className="mt-8 flex flex-col items-center">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatar} />
          <button
            onClick={() => fileRef.current?.click()}
            className="relative size-28 rounded-full bg-gradient-golden shadow-glow flex items-center justify-center overflow-hidden tap"
          >
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <Icon name="add_a_photo" className="text-secondary-deep text-3xl" weight={500} />
            )}
            <span className="absolute bottom-0 right-0 size-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
              <Icon name="edit" className="text-background text-sm" weight={600} />
            </span>
          </button>
          <p className="mt-3 text-xs font-semibold text-foreground/60 uppercase tracking-wider">
            {t("onboarding.profilePicture")}
          </p>
        </div>

        {/* Form */}
        <div className="mt-7 space-y-3">
          <Field label={t("onboarding.farmerName")} icon="person">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("onboarding.namePlaceholder")}
              className="w-full bg-transparent outline-none text-base font-semibold text-foreground placeholder:text-foreground/30"
            />
          </Field>

          <Field label={t("onboarding.totalAcreage")} icon="landscape">
            <div className="flex items-baseline gap-2 w-full">
              <input
                value={acres}
                onChange={(e) => setAcres(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                placeholder="0.0"
                className="flex-1 bg-transparent outline-none text-base font-semibold text-foreground placeholder:text-foreground/30 tabular-nums"
              />
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                {t("onboarding.acresUnit")}
              </span>
            </div>
          </Field>

          {/* Map picker */}
          <button
            onClick={pickLocation}
            className="w-full glass rounded-[20px] overflow-hidden text-left tap"
          >
            <div className="relative h-32 bg-secondary/10 overflow-hidden">
              {/* Mock map */}
              <svg viewBox="0 0 400 160" className="absolute inset-0 w-full h-full">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path
                      d="M20 0 L0 0 L0 20"
                      fill="none"
                      stroke="hsl(142 30% 80%)"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="400" height="160" fill="hsl(142 40% 92%)" />
                <rect width="400" height="160" fill="url(#grid)" />
                <path
                  d="M0 90 Q 100 60, 200 80 T 400 70"
                  stroke="hsl(45 80% 55%)"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.6"
                />
                <path
                  d="M50 0 L 60 60 L 30 100 L 70 160"
                  stroke="hsl(142 60% 50%)"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.5"
                />
                <circle cx="200" cy="80" r="22" fill="hsl(45 100% 50%)" opacity="0.25" />
                <circle cx="200" cy="80" r="10" fill="hsl(142 72% 29%)" />
                <circle cx="200" cy="80" r="4" fill="white" />
              </svg>
            </div>
            <div className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Icon name="location_on" className="text-secondary text-lg" filled />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                  {t("onboarding.farmLocation")}
                </p>
                <p className="text-sm font-semibold text-foreground truncate">{location}</p>
                <p className="text-[11px] text-foreground/50 font-medium tabular-nums">
                  GPS 12.9698° N, 77.7500° E
                </p>
              </div>
              <Icon name="my_location" className="text-secondary" />
            </div>
          </button>
        </div>

        <div className="flex-1 min-h-6" />

        <button
          onClick={saveProfile}
          disabled={!name || !acres || isSaving}
          className="w-full h-16 rounded-full bg-gradient-forest text-background font-semibold text-base shadow-deep flex items-center justify-center gap-2 disabled:opacity-40 tap mt-8 mb-6"
        >
          {isSaving ? t("onboarding.saveProfile") : t("onboarding.continue")}
          <Icon name="arrow_forward" weight={600} />
        </button>
      </div>
    </motion.div>
  );
};

const Field = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) => (
  <div className="glass rounded-[20px] p-4 flex items-center gap-3">
    <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
      <Icon name={icon} className="text-secondary text-lg" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-0.5">
        {label}
      </p>
      {children}
    </div>
  </div>
);
