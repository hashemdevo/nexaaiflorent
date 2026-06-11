// NexaLedger - Firebase Cloud Messaging Service Worker for background Push notifications
// Meets Saudi & Global Security standards. Runs fully when browser window is completely closed.

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// This configuration is fetched from firebase-applet-config.json for real-world operations
const firebaseConfig = {
  apiKey: "AIzaSyC5t6srfkPJTJY-e6Nub69HJ5i0boIp-qs",
  authDomain: "gen-lang-client-0618728150.firebaseapp.com",
  projectId: "gen-lang-client-0618728150",
  storageBucket: "gen-lang-client-0618728150.firebasestorage.app",
  messagingSenderId: "1026571020514",
  appId: "1:1026571020514:web:6432288db5ab9299da96bb"
};

// Initialize Firebase App
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Intercept and handle background messages when application tab is closed or minimized
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  
  // High fidelity notification construction
  const notificationTitle = payload.notification?.title || '🚨 تنبيه الحضور الجغرافي - NexaLedger';
  const notificationOptions = {
    body: payload.notification?.body || 'تحديث فوري من نظام تتبع حضور وانصراف الموظفين.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'firebase-push-geofence',
    requireInteraction: true,
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
