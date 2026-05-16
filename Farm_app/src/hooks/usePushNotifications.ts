import { useEffect, useState } from "react";
import { requestFCMToken, onForegroundMessage } from "@/services/firebase";
import { useUpdateProfile } from "./useFarmer";
import { toast } from "sonner";

export function usePushNotifications() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | "unsupported">("default");
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermissionStatus("unsupported");
      return;
    }

    setPermissionStatus(Notification.permission);

    // Listen for foreground messages
    const unsubscribe = onForegroundMessage((payload: any) => {
      const title = payload?.notification?.title || "FreshOn";
      const body = payload?.notification?.body || "";
      toast.info(title, { description: body });
    });

    return () => unsubscribe();
  }, []);

  const enablePush = async () => {
    const token = await requestFCMToken();
    if (token) {
      setFcmToken(token);
      setPermissionStatus("granted");
      // Send token to backend so it can target this device
      try {
        await updateProfile.mutateAsync({ fcm_token: token });
      } catch {
        // Backend may not support fcm_token yet; that's OK
      }
    }
  };

  return { fcmToken, permissionStatus, enablePush };
}
