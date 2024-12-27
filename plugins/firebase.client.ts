import { initializeApp } from "firebase/app";
import type { Messaging } from "firebase/messaging";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useNotificationStore } from "@/stores/notification";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  //
  const firebaseConfig = config.public.firebaseConfig;
  const vapidKey = config.public.vapidKey;

  // const firebaseConfig = {
  //   apiKey: 'AIzaSyBaQu5PVEUspegu6HsBDzzQIb1-wpwZ95g',
  //   authDomain: 'test-project-notificatio-6f653.firebaseapp.com',
  //   projectId: 'test-project-notificatio-6f653',
  //   storageBucket: 'test-project-notificatio-6f653.firebasestorage.app',
  //   messagingSenderId: '1007601362942',
  //   appId: '1:1007601362942:web:f5acbdba677993287bc2af',
  // }
  // const vapidKey = 'BBLHtz_6F-NFDdkLRU7yulpeNBGf8Xv5aC_suiUeyvmG2ybOGEyhnZTOlhpSJIy84EiRKkVkbNuAYU92ZEjTG-E'
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
          console.log("event.data.type  =================>", event.data);
          if (event.data.type === "notification") {
            const notificationData = event.data.data;
            console.log("event.data.", event);
            console.log(
              "Notification received in the main page from sw:",
              notificationData,
            );
            console.log("notificationData", notificationData);
            localStorage.setItem("newNotify", "true");
            useNotificationStore().saveNotification({
              title: notificationData.body.title,
              body: notificationData.body.body,
            });
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
    const currentToken = localStorage.getItem("firebaseToken");
    if (!currentToken) {
      Notification.requestPermission()
        .then((permission) => {
          if (permission === "granted") createGetToken();
        })
        .catch((error) => {
          console.error("Error requesting notification permission:", error);
        });
    }
  };

  const createGetToken = async () => {
    try {
      const currentToken = await getToken(messaging, { vapidKey });
      if (currentToken) localStorage.setItem("firebaseToken", currentToken);
      else console.log("No registration token available.");
    } catch (err) {
      console.error("Error retrieving token:", err);
    }
  };

  const displayNotification = (message: { title: string; body: string }) => {
    if (Notification.permission === "granted") {
      useNotificationStore().saveNotification(message);
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
      console.log("notification on firebase client ts");
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
