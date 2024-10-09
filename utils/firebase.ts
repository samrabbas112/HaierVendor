// Importing Firebase modules
import { initializeApp } from 'firebase/app'
import type { Messaging } from 'firebase/messaging'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// Define Firebase configuration interface
interface FirebaseConfig {
  apiKey: string
  authDomain?: string
  projectId?: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
  measurementId?: string
}

// Firebase configuration
const firebaseConfig: FirebaseConfig = {
  apiKey: 'AIzaSyC7o-syUZtxtG2bXC_TQgCR3ONtUDl4Ubk',
  authDomain: 'haier-mall.firebaseapp.com',
  projectId: 'haier-mall',
  storageBucket: 'haier-mall.appspot.com',
  messagingSenderId: '870746406313',
  appId: '1:870746406313:web:fbeec57b0054007de998b8',
  measurementId: 'G-EKBSHX9S5Y',
}

// VAPID key for notifications
const vapidKey: string = 'BLsZZXVCKKMPSkrHVr2UUWRE8ioL9H2exfrSVHMKXvWqtLYaC4C8Le9V33hhKieu1DBjBBEZVEZ9gGYO6yK9WVs'

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)

// Initialize Firebase Cloud Messaging
const messaging: Messaging = getMessaging(firebaseApp)

// Function to display notifications
function displayNotification(message: NotificationOptions & { title: string }) {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications.')

    return
  }

  if (!('serviceWorker' in navigator)) {
    console.log('This browser does not support service workers.')

    return
  }

  if (Notification.permission === 'granted') {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) {
        const options: NotificationOptions = {
          body: message.body,
          dir: 'rtl',
          requireInteraction: true,
          renotify: false,
        }

        reg.showNotification(message.title, options)
        localStorage.setItem('newNotify', 'true')
        console.log('Front end message receive storage value:', localStorage.getItem('newNotify'))

        setTimeout(() => {
          if (window.location.href.includes('/orders'))
            window.location.reload()
        }, 2000)
      }
      else {
        console.log('Service worker registration failed')
      }
    }).catch(err => {
      console.log('Service worker registration failed: ', err)
    })
  }
  else {
    console.log('Notification permission status: ', Notification.permission)
  }
}

// Function to create and retrieve Firebase token
async function createGetToken(): Promise<void> {
  console.log('I am calling Create TOKEN for KEY', vapidKey)

  try {
    const currentToken = await getToken(messaging, { vapidKey })

    if (currentToken)
      localStorage.setItem('firebaseToken', currentToken)
    else
      console.log('No registration token available. Request permission to generate one.')
  }
  catch (err) {
    console.error('An error occurred while retrieving token:', err)

    // Optionally, you can re-call createGetToken() in case of failure
  }
}

// Listen for messages from Firebase Cloud Messaging
onMessage(messaging, payload => {
  displayNotification(payload.notification as NotificationOptions & { title: string })
})

// Retrieve Firebase token from localStorage or request one
const currentToken: string | null = localStorage.getItem('firebaseToken')

console.log('currentToken', currentToken)

if (!currentToken) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      console.log('Permission check granted')
      createGetToken()
    }
  }).catch(error => {
    alert('Please enable notifications from the browser')
    console.error('Error requesting notification permission:', error)
  })
}

export { currentToken }

// Check for Notification support and register the service worker
if (!('Notification' in window))
  console.log('This browser does not support notifications.')

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(() => {
      const channel = new BroadcastChannel('fcmNotificationChannel')

      channel.addEventListener('message', (event: MessageEvent) => {
        console.log('event.data.type:', event.data.type)

        if (event.data.type === 'notification') {
          const notificationData = event.data.data

          console.log('Notification received in the main page from SW:', notificationData)
          localStorage.setItem('newNotify', 'true')
        }
      })

      console.log('Service Worker started in browser.')
    }).catch(error => {
    console.error('Service worker registration failed:', error)
  })
}
else {
  console.log('Service workers aren\'t supported in this browser.')
}
