# 🏛️ Component 05 — Backend Server Engine

## ⚙️ Isomorphic Node Server
- **Vite Integration Express**: Integrates Vite programmatically as an assets processing middleware in development mode and serves optimized raw static assets from `dist` in production.
- **Port Ingress Binding**: Binds strictly to Port `3000` and interface `0.0.0.0` (mandated by standard container configurations).

## 📦 Bundling Pipeline
- **esbuild**: Compiles the backend TypeScript entry-point (`server.ts`) to a production-ready CJS bundle inside `dist/server.cjs` during builds, bypassing Node runtime import problems.

## 🚦 Phase Status
- **Status**: 🟢 **100% Fully Implemented and Verified**
- **Artifacts**: `/server.ts`, `package.json` scripts.
