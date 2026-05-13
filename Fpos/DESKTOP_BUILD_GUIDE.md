# FreshOn POS - Windows Desktop App Build Guide

This guide explains how to build the FreshOn POS application as a Windows desktop app using Tauri.

## Prerequisites

### Required Software

1. **Node.js** (v18+) and npm/bun
   - Download from https://nodejs.org/

2. **Rust** (latest stable)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
   - Or download from https://rustup.rs/

3. **Visual Studio Build Tools 2022** (required for Windows)
   - Download from https://visualstudio.microsoft.com/downloads/
   - Install "Desktop development with C++"
   - Or use Visual Studio Community Edition

4. **WebView2 Runtime** (usually already installed on Windows 11+)
   - If needed: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

## Development Setup

### 1. Install Dependencies

```bash
cd Fpos
bun install  # or npm install
```

### 2. Run Development Server

Start the Tauri development environment:

```bash
bun run tauri:dev
# or
npm run tauri:dev
```

This will:
- Start the Vite dev server on http://localhost:8080
- Launch the Tauri application window connected to the dev server
- Enable hot reload for both frontend and backend code

## Building for Windows

### Production Build

Build the Windows installer:

```bash
bun run tauri:build
# or
npm run tauri:build
```

This creates:
- **NSIS Installer** (`.exe` file) - Easiest installation method
- **MSI Installer** - Alternative Windows installer format

Output location: `src-tauri/target/release/bundle/`

### Windows Specific Build

For x86_64 Windows (most common):

```bash
bun run tauri:build:windows
```

## Build Output

After a successful build, you'll find:

- **NSIS Installer**: `src-tauri/target/release/bundle/nsis/FreshOn-POS-{version}.exe`
  - Standalone executable installer
  - Includes uninstaller
  - Creates Start Menu shortcuts

- **MSI Installer**: `src-tauri/target/release/bundle/msi/`
  - Windows Installer format
  - Enterprise-friendly

## Troubleshooting

### Build Fails with "Rust toolchain not found"
```bash
rustup update
rustup target add x86_64-pc-windows-gnu
rustup target add x86_64-pc-windows-msvc
```

### WebView2 Runtime Missing
Download from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Visual Studio Build Tools Error
Ensure C++ development tools are installed:
1. Run Visual Studio Installer
2. Modify your installation
3. Add "Desktop development with C++"

### Port Already in Use
If port 8080 is busy, edit `vite.config.ts`:
```typescript
server: {
  port: 3000,  // Change to available port
}
```

And update `src-tauri/tauri.conf.json`:
```json
"devUrl": "http://localhost:3000"
```

## Code Signing (Optional)

To sign the installer for distribution:

1. Obtain a Windows code signing certificate
2. Update `src-tauri/tauri.conf.json`:
```json
"windows": {
  "certificateThumbprint": "YOUR_THUMBPRINT",
  "digestAlgorithm": "sha256",
  "signingIdentity": "YOUR_IDENTITY"
}
```

## Distribution

1. **NSIS Installer** (recommended):
   - Small file size (~50-150 MB)
   - User-friendly installation
   - Native Windows installer UX

2. **Deploy via**:
   - Direct download link
   - Windows Package Manager
   - Enterprise app store

## Development Tips

### Frontend-Only Changes
Hot reload works automatically - just save files in `src/`

### Rust-Backend Changes
Restart the dev server:
```bash
# Stop current session (Ctrl+C)
bun run tauri:dev
```

### Access DevTools
Press `Ctrl+Shift+I` (or `Cmd+Option+I` on macOS) in development mode

### Environment Variables
Create `.env` file in root:
```
VITE_API_URL=http://localhost:3000
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## References

- [Tauri Documentation](https://tauri.app/)
- [Tauri Windows Bundler](https://tauri.app/en/v1/guides/building/windows/)
- [Vite Documentation](https://vitejs.dev/)
