# FreshOn POS - Desktop App Quick Commands

## Quick Start

```bash
# Install dependencies
bun install

# Development (runs web + desktop app together)
bun run tauri:dev

# Build for Windows
bun run tauri:build

# Build Windows installer specifically
bun run tauri:build:windows
```

## What's Configured

✅ **Tauri 2.11** - Desktop framework  
✅ **Windows Installer (NSIS)** - Easy installation  
✅ **Hot Reload** - Changes reflect instantly in dev  
✅ **Windows MSI Alternative** - For enterprise deployments  
✅ **Auto-Updates Ready** - Structure supports future updates  

## Output Files

After `bun run tauri:build`:
- 📦 Installer: `src-tauri/target/release/bundle/nsis/FreshOn-POS-*.exe`
- 📦 Alternative: `src-tauri/target/release/bundle/msi/`

## Next Steps

1. Install prerequisites: Node.js, Rust, Visual Studio Build Tools (C++)
2. Run `bun install` in Fpos directory
3. Run `bun run tauri:dev` to test
4. Run `bun run tauri:build` to create installer

## Documentation

See [DESKTOP_BUILD_GUIDE.md](./DESKTOP_BUILD_GUIDE.md) for detailed setup instructions.
