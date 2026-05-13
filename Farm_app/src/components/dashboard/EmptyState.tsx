import { motion } from "framer-motion";
import { Icon } from "@/components/freshon/Icon";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-12 px-6 text-center"
  >
    <div className="size-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
      <Icon name={icon} className="text-secondary text-2xl" filled />
    </div>
    <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-foreground/60 mb-6">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-4 py-2 rounded-full bg-secondary text-background font-semibold text-sm tap"
      >
        {action.label}
      </button>
    )}
  </motion.div>
);
