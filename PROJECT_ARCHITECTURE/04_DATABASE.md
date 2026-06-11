# PROJECT_ARCHITECTURE: Database / Storage Component 🗄️

## Description
This component outlines the Firebase Cloud Firestore database configuration, key collections, sub-queries, and synchronization patterns.

## Current State
- **Core Database**: Firebase Cloud Firestore.
- **Key Collections**:
  - `attendance_logs`: Stores check-in / check-out history including geo-coordinates, accuracy values, spoof results, branch names, and device signatures.
  - `anti_spoof_logs`: Stores security alarm details, rooted OS warnings, and unauthorized proxy attempts.
  - `biometric_devices`: Binds an employee's email to their registered mobile phone's hardware parameters and WebAuthn public keys.
  - `employee_assignments`: Allocates staff members to worksite branches.

## Alignment & Impact Audits
1. **Frontend**: Populates list tables, metrics displays, and device validation status cards.
2. **Security**: Holds the cryptographic reference key to verify device owners.

## Implementation Status
- [x] Persistent real-time `attendance_logs` integration.
- [x] Secure `anti_spoof_logs` logging.
- [x] Secure `biometric_devices` hardware credentials indexing.
- [x] Live branch worksite coordinates allocations.
