# PROJECT_ARCHITECTURE: Frontend Component ⚛️

## Description
This component outlines the React view engines, Context files, sub-components tree, and validation states of the application.

## Current State
- **Core Engine**: React 18+ powered by Vite build engine.
- **State Management**:
  - `AppContext.tsx` stores authenticated identities, current universal roles, and global status overlays.
  - Page-level states handle coordinate trackers, spoof alarm flags, and interactive sliders.
- **Modularity**: Sub-components are extracted to optimize token generation and compilation speeds. For example, `EmployeeTree.tsx` is encapsulated separately.

## Alignment & Impact Audits
1. **UI**: Translates state properties (`inGeofence`, `registeredDevice`) into visual status cards.
2. **Backend**: Dispatches asynchronous Firestore operations to record clock events and logs.
3. **Hardware**: Collects real coordinates from Geolocation APIs and native credentials from WebAuthn triggers.

## Implementation Status
- [x] Context identity mappings (`currentUserIdentity`, `currentUniversalRole`).
- [x] GPS status handler state trackers.
- [x] Interactive geofence and integrity scanning loops.
- [ ] Automated client-side service worker cache (Pending).
