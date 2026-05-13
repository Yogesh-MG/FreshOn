import { motion } from "framer-motion";
import { Icon } from "@/components/freshon/Icon";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useFarmer";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, string> = {
  success: "bg-green-100 text-green-600",
  warning: "bg-amber-100 text-amber-600",
  error: "bg-red-100 text-red-600",
  info: "bg-blue-100 text-blue-600",
};

const ICON_MAP: Record<string, string> = {
  success: "check_circle",
  warning: "warning",
  error: "error",
  info: "info",
};

export const NotificationsDrawer = ({ onClose }: { onClose: () => void }) => {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed md:absolute inset-0 z-40 bg-secondary-deep/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed md:absolute bottom-0 left-0 right-0 z-50 bg-background rounded-t-[32px] shadow-deep max-h-[80%] overflow-hidden flex flex-col"
      >
        <div className="px-6 pt-3 pb-2 flex justify-center">
          <div className="h-1.5 w-12 rounded-full bg-muted" />
        </div>
        <div className="px-6 pb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              Hub
            </p>
            <h3 className="text-2xl font-extrabold tracking-tight">Notifications</h3>
          </div>
          <button
            onClick={() => {
              markRead.mutate(undefined);
              onClose();
            }}
            className="text-xs font-bold text-primary tap"
          >
            Mark all read
          </button>
        </div>

        <div className="overflow-y-auto px-4 pb-8 space-y-2">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : notifications?.length === 0 ? (
            <div className="py-20 text-center opacity-40">
              <Icon name="notifications_off" className="text-4xl mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">No notifications</p>
            </div>
          ) : (
            notifications?.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => !n.is_read && markRead.mutate(n.id)}
                className={cn(
                  "rounded-[20px] glass p-4 flex gap-3 tap transition-colors",
                  !n.is_read && "bg-primary/5"
                )}
              >
                <div className={`size-11 rounded-xl shrink-0 flex items-center justify-center ${COLOR_MAP[n.type]}`}>
                  <Icon name={ICON_MAP[n.type]} className="text-lg" filled />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-sm">{n.title}</p>
                    <span className="text-[11px] font-medium text-foreground/40">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/70 font-medium leading-relaxed mt-0.5">
                    {n.message}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
};
