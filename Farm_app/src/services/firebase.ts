import { initializeApp, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export function initFirebase() {
  if (app) return { app, messaging };
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn("[FCM] Firebase not configured. Set VITE_FIREBASE_* env variables.");
    return { app: null, messaging: null };
  }
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
  return { app, messaging };
}

export async function requestFCMToken(): Promise<string | null> {
  const { messaging } = initFirebase();
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[FCM] Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });
    if (token) {
      console.log("[FCM] Token received:", token);
      return token;
    }
    return null;
  } catch (error) {
    console.error("[FCM] Error getting token:", error);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: unknown) => void) {
  const { messaging } = initFirebase();
  if (!messaging) return () => {};
  return onMessage(messaging, callback as any);
}
