# 🏛️ Component 08 — Cloud Notification & Push Matrix

## 📨 FCM Cloud Push Infrastructure
- **Cloud Service Worker**: Registers the highly robust, always-on `/public/firebase-messaging-sw.js` background worker.
- **Background Handlers**: Captures background messaging payloads instantly *even when the browser or mobile application is completely closed*.
- **Foreground Handlers**: Employs elegant in-app alert sliders and synthesizer alerts if workers capture alerts while the user is actively viewing the panel.

## 🔑 Device Key Registration
- **Tokens Capture**: Requests push authorization dynamically from the user, registers device FCM push tokens, and securely persists keys to Firestore inside `employee_fcm_tokens`.

## 🚦 Phase Status
- **Status**: 🟢 **100% Fully Implemented and Verified**
- **Artifacts**: `/public/firebase-messaging-sw.js`, `/components/hrm/HRMAttendance.tsx`.
