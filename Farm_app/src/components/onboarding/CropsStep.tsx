import { motion } from "framer-motion";
import { useState } from "react";
import { StepHeader } from "../freshon/StepHeader";
import { Icon } from "@/components/freshon/Icon";
import { useProfile, useUpdateProfile } from "@/hooks/useFarmer";
import { getApiErrorMessage } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const SEASONAL = [
  "Tomatoes", "Spinach", "Cauliflower", "Carrots", "Beetroot",
  "Okra", "Brinjal", "Cucumber", "Pumpkin", "Methi", "Coriander",
  "Green chillies", "Capsicum",
];

const PERENNIAL = [
  "Mango", "Banana", "Coconut", "Papaya", "Drumstick",
  "Curry leaves", "Lemon", "Guava", "Jackfruit",
];

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const CropsStep = ({ onNext, onBack }: Props) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(["Tomatoes", "Spinach", "Mango"]));
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const toggle = (c: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  const saveCrops = async () => {
    const crops = Array.from(selected);
    try {
      await updateProfile.mutateAsync({
        crops,
        speciality: crops.slice(0, 3).join(", "),
        bio: [profile?.bio?.replace(/\n?Crops: .*/g, ""), `Crops: ${crops.join(", ")}`].filter(Boolean).join("\n"),
      });
      onNext();
    } catch (error) {
      toast({
        title: "Crops not saved",
        description: getApiErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      key="crops"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="min-h-dvh md:min-h-[860px] flex flex-col"
    >
      <StepHeader current={4} total={6} onBack={onBack} label="Your Crops" />

      <div className="px-7 pt-8 flex-1 flex flex-col">
        <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
          What do you <span className="text-secondary">grow?</span>
        </h2>
        <p className="mt-2 text-foreground/60 font-medium">
          Select all crops you cultivate organically. {selected.size} selected.
        </p>

        <Section title="Seasonal" icon="wb_sunny">
          <PillList items={SEASONAL} selected={selected} onToggle={toggle} />
        </Section>

        <Section title="Perennial" icon="park">
          <PillList items={PERENNIAL} selected={selected} onToggle={toggle} />
        </Section>

        <div className="flex-1 min-h-6" />

        <button
          onClick={saveCrops}
          disabled={selected.size === 0 || updateProfile.isPending}
          className="w-full h-16 rounded-full bg-gradient-forest text-background font-semibold text-base shadow-deep flex items-center justify-center gap-2 disabled:opacity-40 tap mt-8 mb-6"
        >
          {updateProfile.isPending ? "Saving..." : "Continue"}
          <Icon name="arrow_forward" weight={600} />
        </button>
      </div>
    </motion.div>
  );
};

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) => (
  <div className="mt-7">
    <div className="flex items-center gap-2 mb-3">
      <Icon name={icon} className="text-primary text-base" filled />
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">{title}</h3>
    </div>
    {children}
  </div>
);

const PillList = ({
  items,
  selected,
  onToggle,
}: {
  items: string[];
  selected: Set<string>;
  onToggle: (c: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => {
      const active = selected.has(item);
      return (
        <motion.button
          key={item}
          whileTap={{ scale: 0.94 }}
          onClick={() => onToggle(item)}
          className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all border ${
            active
              ? "bg-secondary text-background border-secondary shadow-soft"
              : "bg-white/60 text-foreground/80 border-border hover:border-secondary/40"
          }`}
        >
          {active && <span className="mr-1.5">✓</span>}
          {item}
        </motion.button>
      );
    })}
  </div>
);
