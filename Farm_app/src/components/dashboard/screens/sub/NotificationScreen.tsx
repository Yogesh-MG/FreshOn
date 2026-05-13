import { useNotifications, useMarkNotificationRead } from "@/hooks/useFarmer";
import { Icon } from "@/components/freshon/Icon";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  onBack: () => void;
}

export const NotificationScreen = ({ onBack }: Props) => {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  const handleMarkAllRead = () => {
    markRead.mutate(undefined);
  };

  const handleRead = (id: string) => {
    markRead.mutate(id);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <header className="px-5 h-16 flex items-center justify-between border-b border-border/60">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="size-10 rounded-xl glass flex items-center justify-center tap">
            <Icon name="arrow_back" />
          </button>
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
        <button 
          onClick={handleMarkAllRead}
          className="text-xs font-bold text-primary hover:opacity-70 tap"
        >
          Mark all as read
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
            <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading...</p>
          </div>
        ) : notifications?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-10 text-center gap-4 opacity-40">
            <Icon name="notifications_off" className="text-6xl" />
            <div>
              <p className="font-bold">All caught up!</p>
              <p className="text-xs mt-1">We'll notify you when you have new orders or payouts.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {notifications?.map((notif) => (
              <button
                key={notif.id}
                onClick={() => !notif.is_read && handleRead(notif.id)}
                className={cn(
                  "w-full p-5 text-left flex gap-4 transition-colors tap",
                  !notif.is_read ? "bg-primary/5" : "hover:bg-muted/20"
                )}
              >
                <div className={cn(
                  "size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                  notif.type === 'success' ? "bg-green-100 text-green-600" :
                  notif.type === 'warning' ? "bg-amber-100 text-amber-600" :
                  notif.type === 'error' ? "bg-red-100 text-red-600" :
                  "bg-blue-100 text-blue-600"
                )}>
                  <Icon 
                    name={
                      notif.type === 'success' ? 'check_circle' :
                      notif.type === 'warning' ? 'warning' :
                      notif.type === 'error' ? 'error' : 'info'
                    } 
                    filled 
                    className="text-lg" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("font-bold text-sm", !notif.is_read && "text-primary")}>{notif.title}</p>
                    <p className="text-[10px] font-medium text-foreground/40 whitespace-nowrap">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-xs text-foreground/60 leading-relaxed mt-0.5 line-clamp-2">
                    {notif.message}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
