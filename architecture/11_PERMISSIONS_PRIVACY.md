# 🏛️ Component 11 — SDPL & GDPR Privacy Matrix

## 🔒 Saudi Data Protection Law (SDPL) Conformance
- **Compliance Priority**: Direct response to potential employee tracking privacy violations outside work hours.
- **Geographical Protection Gate**: Enforces full GPS masking and location purging immediately after an employee registers a "Clock-Out" (`OUT`).
- **Role & Archetype Classifications**:
  - `REGULAR` (Fixed Office Employee): Zero background tracking. Their GPS coordinates are evaluated *strictly* at the moment they scan their fingerprint at check-in/out to ensure they stand inside the building boundary. Continuous tracking is permanently disabled for their accounts.
  - `DRIVER` (Logistics Delivery Staff): Tracking allowed during open active transit shifts. Once they press "تسجل خروج", their location markers disappear from maps in real-time.

## ⚙️ Administration Dashboard Toggles
- **Strict Privacy Mode Toggle**: A master switch on the GIS Map controls page allowing corporate admins to activate or deactivate Saudi Law Privacy safeguards.
- **Dynamic Settings Matrix**: Allows Assigning corporate employees specific branch boundaries and choosing their exact private archetype classification.

## 🚦 Phase Status
- **Status**: 🟢 **100% Fully Implemented and Verified**
- **Artifacts**: `/components/hrm/HRMAttendance.tsx`, `/components/hrm/EmployeeTree.tsx`.
