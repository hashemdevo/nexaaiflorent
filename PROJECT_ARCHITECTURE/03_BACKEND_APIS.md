# PROJECT_ARCHITECTURE: Backend / APIs Component 🌐

## Description
This component governs the Node.js Express application servers, REST routing endpoints, request parsers, and custom proxy routing handlers.

## Current State
- **Core server**: Express application in `server.ts` utilizing unified single-file bundled compiling.
- **Vite Integration**: Operates as development middleware (`createViteServer`) on dev servers, and serves compiled static directories in production environments.
- **Port Ingress**: Maps strictly to container Port `3000` to satisfy Cloud Run proxy ingress constraints.

## Alignment & Impact Audits
1. **Frontend**: Proxies browser asset queries to static builds.
2. **Database**: Houses core initialization connectors to isolate private keys or configurations.

## Implementation Status
- [x] Port `3000` host binding configuration (`0.0.0.0`).
- [x] Dual environment routing (Dev Vite Middleware vs Prod Express Statics).
- [ ] Direct API route proxy rate-limiting (Pending).
