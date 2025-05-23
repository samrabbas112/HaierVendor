// Import the Firebase app and messaging scripts
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.21.0/firebase-messaging-compat.js');

console.log('firebase-messaging-sw.js loaded')


// Initialize the Firebase app in the service worker using your app's Firebase configuration
// You can use a reduced configuration here, only including the fields you need
firebase.initializeApp({
    apiKey: 'AIzaSyC7o-syUZtxtG2bXC_TQgCR3ONtUDl4Ubk',
    authDomain: 'haier-mall.firebaseapp.com',
    projectId: 'haier-mall',
    storageBucket: 'haier-mall.appspot.com',
    messagingSenderId: '870746406313',
    appId: "1:870746406313:web:fbeec57b0054007de998b8",
    measurementId: 'G-EKBSHX9S5Y',
})

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging()

// Handle background messages received while the web app is not in the foreground
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload)
    console.log('notification on [firebase-messaging-sw.js]')

      const notificationTitle = payload.notification.title;
      const notificationOptions = {
          body: payload.notification,
          icon: '/firebase-logo.png', // Example icon, replace with your own
        }
        
        const channel = new BroadcastChannel('fcmNotificationChannel');
        channel.postMessage({ type: 'notification', data: notificationOptions });

    // Show notification in the service worker
    // eslint-disable-next-line no-restricted-globals
    // self.registration.showNotification(notificationTitle, notificationOptions)
    //
    // self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
    //     clients.forEach((client) => {
    //         client.postMessage({
    //             type: 'NEW_NOTIFICATION',
    //             payload,
    //         });
    //     });
    // });
})
