import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyC7o-syUZtxtG2bXC_TQgCR3ONtUDl4Ubk',
  authDomain: 'haier-mall.firebaseapp.com',
  projectId: 'haier-mall',
  storageBucket: 'haier-mall.appspot.com',
  messagingSenderId: '870746406313',
  appId: '1:870746406313:web:fbeec57b0054007de998b8',
  measurementId: 'G-EKBSHX9S5Y',
}

const firebaseApp = initializeApp(firebaseConfig)
const messaging = getMessaging(firebaseApp)

interface NotificationMessage {
  title: string
  body: string
}

function displayNotification(message: NotificationMessage) {
  if (!('Notification' in window)) {
    console.log('this browser does not support notification.')
    return
  }

  if (!('serviceWorker' in navigator)) {
    console.log('This browser does not support notification.')
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
        console.log('Frontend message received storage value: ', localStorage.getItem('newNotify'))

        setTimeout(() => {
          if (window.location.href.includes('/orders')) {
            window.location.reload()
          }
        }, 2000)
      } else {
        console.log('Service Worker Registration Failed.')
      }
    }).catch(err => {
      console.log('Service worker registration failed: ', err)
    })
  } else {
    console.log('Notification Permission status: ', Notification.permission)
  }
}

async function createGetToken(): Promise<void> {
  const vapidKey = 'BLsZZXVCKKMPSkrHVr2UUWRE8ioL9H2exfrSVHMKXvWqtLYaC4C8Le9V33hhKieu1DBjBBEZVEZ9gGYO6yK9WVs' // Ensure your VAPID key is defined properly
  try {
    const token = await getToken(messaging, { vapidKey })
    console.log('==============token===================', token)
    if (token) {
      localStorage.setItem('firebaseToken', token)
    } else {
      console.log('No registration token available. Request permission to generate one.')
    }
  } catch (err) {
    console.log('An error occurred while retrieving token: ', err)
  }
}

onMessage(messaging, payload => {
  displayNotification(payload.notification as NotificationMessage)
})

const currentToken = localStorage.getItem('firebaseToken')

if (!currentToken) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      createGetToken().then(() => console.log('Token generated successfully'))
    }
  }).catch(error => {
    alert('Please enable notifications from the browser')
    console.log('Error requesting notification permissions: ', error)
  })
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js').then(() => {
    const channel = new BroadcastChannel('fcmNotificationChannel')
    channel.addEventListener('message', event => {
      if (event.data.type === 'notification') {
        localStorage.setItem('newNotify', 'true')
      }
    })
    console.log('Service Worker registered')
  }).catch(err => {
    console.log('Service Worker registration failed: ', err)
  })
}

// Named export to be used in other files
export { createGetToken, currentToken }
