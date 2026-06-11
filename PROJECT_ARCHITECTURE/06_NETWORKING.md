# PROJECT_ARCHITECTURE: Networking / Gateway Component 🌐

## Description
This component outlines the ingress routing parameters, CORS configuration, iframe constraints, and security proxies.

## Current State
- **Proxy Gateway**: Nginx reverse proxy routes traffic strictly to port `3000`.
- **Private constraints**: Direct browser geolocation requests may be blocked inside restricted preview block iframes if top-level access is denied. The front-end includes adaptive coordinators that prompt users or fall back to secure coordinate testing vectors.
- **WebAuthn**: Requires Secure Context (`https://` or `localhost`). Native WebAuthn triggers fallback safe simulation loops if executed inside restricted iframes.

## Alignment & Impact Audits
1. **Server**: Consumes requests on local network ports.
2. **UI**: Warns employees if location triggers context errors.

## Implementation Status
- [x] Host ingress binding to `0.0.0.0` to permit external proxy tunnels.
- [x] Context-aware fallback routines if browser blockades native navigator APIs.
- [ ] Automated keep-alive network signals (Pending).
