import { motion } from "framer-motion";
import { Icon } from "@/components/freshon/Icon";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useFarmer";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

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

const NOTIF_TYPE_ICON: Record<string, string> = {
  new_order: "shopping_basket",
  payment_credited: "account_balance_wallet",
  quality_alert: "feedback",
  pickup_scheduled: "local_shipping",
  general: "notifications",
};

const NOTIF_TYPE_COLOR: Record<string, string> = {
  new_order: "bg-secondary/10 text-secondary",
  payment_credited: "bg-primary/10 text-primary",
  quality_alert: "bg-destructive/10 text-destructive",
  pickup_scheduled: "bg-blue-100 text-blue-600",
  general: "bg-muted text-foreground/60",
};

export const NotificationsDrawer = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
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
              {t("notifications.hub")}
            </p>
            <h3 className="text-2xl font-extrabold tracking-tight">{t("dashboard.notifications")}</h3>
          </div>
          <button
            onClick={() => {
              markRead.mutate(undefined);
              onClose();
            }}
            className="text-xs font-bold text-primary tap"
          >
            {t("dashboard.markAllRead")}
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
              <p className="text-xs font-bold uppercase tracking-widest">{t("dashboard.noNotifications")}</p>
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
                <div className={`size-11 rounded-xl shrink-0 flex items-center justify-center ${NOTIF_TYPE_COLOR[n.notification_type || 'general'] || COLOR_MAP[n.type]}`}>
                  <Icon name={NOTIF_TYPE_ICON[n.notification_type || 'general'] || ICON_MAP[n.type]} className="text-lg" filled />
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
                  {n.metadata && Object.keys(n.metadata).length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {Object.entries(n.metadata).map(([k, v]) => (
                        <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium text-foreground/50">
                          {k}: {String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
};
