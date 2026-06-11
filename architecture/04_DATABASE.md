# 🏛️ Component 04 — Database Schemas & Persistence

## 🔥 Cloud Firestore Layout
- **`employee_branches`**: Document mapping per employee email to their assigned corporate branch and geofenced worksite.
- **`employee_archetypes`**: SDPL security classification document mapping employee email to their tracking archetype (`REGULAR` vs `DRIVER`).
- **`employee_fcm_tokens`**: Stores FCM tokens generated on registration to trigger push notifications.
- **`attendance_logs`**: Chronological log repository capturing exact checkins, selfie URLs, compliance flags, spoof ratings, and device fingerprints.

## 💾 Offline Cache
- **Local Persistence Enabled**: Firestore offline cache stores previous records reliably on the client device even in offline mining fields, synchronizing back instantly once networks re-establish.

## 🚦 Phase Status
- **Status**: 🟢 **100% Fully Implemented and Verified**
- **Artifacts**: `/services/firebaseConfig.ts`, Firestore controllers in `/components/hrm/HRMAttendance.tsx`.
