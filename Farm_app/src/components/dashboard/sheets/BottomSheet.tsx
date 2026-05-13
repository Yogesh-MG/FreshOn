import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Icon } from "@/components/freshon/Icon";

interface Props {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export const BottomSheet = ({ title, eyebrow, onClose, children, footer }: Props) => (
  <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed md:absolute inset-0 z-40 bg-secondary-deep/45 backdrop-blur-sm"
    />
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 280 }}
      className="fixed md:absolute bottom-0 left-0 right-0 z-50 bg-background rounded-t-[32px] shadow-deep max-h-[92%] flex flex-col"
    >
      <div className="px-6 pt-3 pb-2 flex justify-center shrink-0">
        <div className="h-1.5 w-12 rounded-full bg-muted" />
      </div>
      <div className="px-6 pb-3 flex items-start justify-between shrink-0">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              {eyebrow}
            </p>
          )}
          <h3 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h3>
        </div>
        <button
          onClick={onClose}
          className="size-10 rounded-full bg-muted flex items-center justify-center tap shrink-0"
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="overflow-y-auto px-6 pb-6 flex-1">{children}</div>
      {footer && (
        <div className="px-6 pt-3 pb-6 border-t border-border/60 bg-background/95 backdrop-blur-xl shrink-0">
          {footer}
        </div>
      )}
    </motion.div>
  </>
);
