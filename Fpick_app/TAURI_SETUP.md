# Fpick_app Tauri Setup Guide

## Overview
Fpick_app has been configured with **Tauri v2** for native mobile/desktop support with **camera, barcode scanning, and HTTP capabilities**.

## Architecture

```
Fpick_app/
├── src/                 # React/TypeScript frontend
├── src-tauri/          # Tauri Rust backend
│   ├── src/
│   │   ├── main.rs     # Entry point
│   │   └── lib.rs      # Tauri app initialization
│   ├── Cargo.toml      # Rust dependencies
│   ├── tauri.conf.json # Tauri configuration
│   ├── build.rs        # Build script
│   └── capabilities/   # Security capabilities
├── vite.config.ts      # Vite + Tauri config
└── package.json        # Node dependencies
```

## Key Dependencies

### Tauri Plugins
- **@tauri-apps/api**: Core Tauri API
- **@tauri-apps/plugin-barcode**: QR/Barcode scanning
- **@tauri-apps/plugin-camera**: Camera access
- **@tauri-apps/plugin-http**: HTTP client
- **@tauri-apps/plugin-shell**: Shell command execution

### Capabilities
All permissions are defined in `src-tauri/capabilities/default.json`:
- `camera:*` - Camera access for scanning
- `barcode:*` - Barcode/QR detection
- `shell:open` - Open URLs/apps
- `http:default` - Make HTTP requests
- `core:window:*` - Window management

## Commands

### Development
```bash
# Web dev (port 1420)
npm run dev

# Tauri dev (hot reload on device)
npm run app:tauri:dev
```

### Android
```bash
# Debug APK
npm run app:tauri:android:build -- --debug

# Release APK (signed)
npm run app:tauri:android:build
```

### Build
```bash
# Production web build
npm run build

# Production Tauri bundle
npm run app:tauri:build
```

## Setup Checklist

- [x] Rust backend structure created
- [x] Tauri configuration (`tauri.conf.json`)
- [x] Cargo dependencies with camera/barcode plugins
- [x] Security capabilities defined
- [x] Vite Tauri integration
- [x] NPM scripts for dev/build
- [ ] **TODO**: Run `npm install` to fetch dependencies
- [ ] **TODO**: Copy app icons to `src-tauri/icons/`
- [ ] **TODO**: Create barcode scanning React component
- [ ] **TODO**: Connect to backend API

## Backend Integration (Next Steps)

The app is now ready to:
1. Connect to the Freshon backend API
2. Use shared API client from `@freshon/api`
3. Implement QR/barcode scanning for product lookup
4. Add offline-first data sync if needed

## Notes

- All camera/barcode calls go through Tauri's safe IPC layer
- HTTP requests use the Tauri plugin (CORS-safe)
- App permissions are enforced by Tauri security model
- Same codebase runs on desktop (Windows/Mac/Linux) and mobile (Android/iOS)

See [Consumer_app](../Consumer_app) for similar Tauri setup patterns.
