import { initializeApp } from "firebase/app";
import {
  getMessaging,
  onMessage,
  getToken,
  Messaging,
} from "firebase/messaging";
import {serviceWorker} from "nitropack/dist/shared/nitro.18796496";
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  // const firebaseConfig = config.public.firebaseConfig;
  // const vapidKey = config.public.vapidKey;

   const firebaseConfig = {
    apiKey: "AIzaSyBaQu5PVEUspegu6HsBDzzQIb1-wpwZ95g",
    authDomain: "test-project-notificatio-6f653.firebaseapp.com",
    projectId: "test-project-notificatio-6f653",
    storageBucket: "test-project-notificatio-6f653.firebasestorage.app",
    messagingSenderId: "1007601362942",
    appId: "1:1007601362942:web:f5acbdba677993287bc2af"
  };

  const vapidKey = "BLsZZXVCKKMPSkrHVr2UUWRE8ioL9H2exfrSVHMKXvWqtLYaC4C8Le9V33hhKieu1DBjBBEZVEZ9gGYO6yK9WVs"

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
    // console.log("Notification received in the main page:", message);
    // if (Notification.permission === "granted") {
    //   navigator.serviceWorker.getRegistration().then((reg) => {
    //     if (reg) {
    //       reg.showNotification(message.title, {
    //         body: message.body,
    //         dir: "rtl",
    //         requireInteraction: true,
    //         renotify: false,
    //       });
    //     }
    //   });
    // }

    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.');
      return;
    }
    if (!('serviceWorker' in navigator)) {
      console.log('This browser does not support service workers.');
      return;
    }
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.getRegistration().then(function(reg) {
        if (reg) {
          const options = {
            title:message.title,
            body: message.body,
            dir: 'rtl',
            requireInteraction: true,
            renotify: false,
          };

          reg.showNotification(message.title, options);

          // Retrieve the notification counter from localStorage, parse it to an integer, increment it, and then save it back
          localStorage.setItem('newNotify',true);
          console.log('front end message receive storage value:',localStorage.getItem('newNotify'));
          // setTimeout(() => {
          //   window.location.href.includes('/orders')?window.location.reload():'';
          // }, 2000);

        } else {
          console.log('Service worker registration failed');
        }
      }, function(err) {
        console.log('Service worker registration failed: ', err);
      });
    } else {
      console.log('Notification permission status: ', Notification.permission);
    }

  };

  onMessage(messaging, (payload) => {
    console.log("Notification received in the main page:", payload);
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(payload);
      console.log("Message posted to service worker:", payload);
    } else {
      console.warn("No active service worker controller to handle the message.");
    }

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
