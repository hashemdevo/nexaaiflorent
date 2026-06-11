# PROJECT_ARCHITECTURE: Offline Persistence & Offline Syncs 💾

## Description
This component outlines client-side local caching, indexed signatures, and backup fallback drivers.

## Current State
- **Primary storage**: Firestore cloud database (real-time collections).
- **Secondary caching**: LocalStorage stores a copy of the employee's registered device credentials (`bio_device_[email]`).
- **Sync mechanism**: Upon page load, if Firestore is reachable but missing the device record, the app synchronizes from LocalStorage. This guarantees seamless device enforcement even during intermediate server connectivity shifts.

## Alignment & Impact Audits
1. **Database**: Aligns keys to reflect matching document fields.
2. **Security**: Holds cryptographic WebAuthn credentials securely in browser sandboxes.

## Implementation Status
- [x] LocalStorage fallback loops for biometric device definitions.
- [x] Sync-up algorithms from LocalStorage to Cloud Firestore.
- [ ] IndexedDB custom logs pooling (Pending).
