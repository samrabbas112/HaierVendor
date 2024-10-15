import { initializeApp } from "firebase/app";
import {
  getMessaging,
  onMessage,
  getToken,
  Messaging,
} from "firebase/messaging";
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const firebaseConfig = config.public.firebaseConfig;
  const vapidKey = config.public.vapidKey;

  const firebaseApp = initializeApp(firebaseConfig);
  const messaging: Messaging = getMessaging(firebaseApp);

  if ("serviceWorker" in navigator) {
    // Register the service worker
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((initialiseState) => {
        console.log("Service Worker started in browser.");
        const channel = new BroadcastChannel("fcmNotificationChannel");
        channel.addEventListener("message", (event) => {
          console.log("event.data.type  =================>", event.data.type);
          if (event.data.type === "notification") {
            const notificationData = event.data.data;
            console.log(
              "Notification received in the main page from sw:",
              notificationData,
            );
            localStorage.setItem("newNotify", "true");
          }
        });
      })
      .catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
  } else {
    console.log("Service workers aren't supported in this browser.");
  }

  const requestNotificationPermission = async () => {
    let currentToken = localStorage.getItem("firebaseToken");
    if (!currentToken) {
      Notification.requestPermission()
        .then((permission) => {
          if (permission === "granted") {
            createGetToken();
          }
        })
        .catch((error) => {
          console.error("Error requesting notification permission:", error);
        });
    }
  };

  const createGetToken = async () => {
    try {
      const currentToken = await getToken(messaging, { vapidKey });
      if (currentToken) {
        localStorage.setItem("firebaseToken", currentToken);
      } else {
        console.log("No registration token available.");
      }
    } catch (err) {
      console.error("Error retrieving token:", err);
    }
  };

  const displayNotification = (message: { title: string; body: string }) => {
    if (Notification.permission === "granted") {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.showNotification(message.title, {
            body: message.body,
            dir: "rtl",
            requireInteraction: true,
            renotify: false,
          });
        }
      });
    }
  };

  onMessage(messaging, (payload) => {
    if (payload.notification) {
      displayNotification(
        payload.notification as { title: string; body: string },
      );
    }
  });

  return {
    provide: {
      firebaseMessaging: {
        requestNotificationPermission,
        createGetToken,
        messaging,
      },
    },
  };
});
