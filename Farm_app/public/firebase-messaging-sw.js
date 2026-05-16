// Firebase Cloud Messaging Service Worker
// This file must be at the root of the public directory
// Replace the config below with your Firebase project credentials

importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// TODO: Replace with your Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "FreshOn Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    data: payload.data,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      if (clientList.length > 0) {
        clientList[0].focus();
      } else {
        clients.openWindow("/");
      }
    })
  );
});
