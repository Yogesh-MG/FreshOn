# 🚀 GStack Development Guide

This guide outlines the specialized AI "skills" and workflows available in this project using [gstack](https://github.com/garrytan/gstack).

## 🛠️ The Core Workflow

gstack works best when you follow the standard engineering lifecycle: **Think → Plan → Build → Review → Test → Ship**.

| Category | Command | Specialist Role | Purpose |
| :--- | :--- | :--- | :--- |
| **Strategy** | `/office-hours` | YC CEO | Challenge ideas and refine the product vision. |
| **Planning** | `/autoplan` | Review Pipeline | Generate a complete, multi-role reviewed plan. |
| **Planning** | `/plan-eng-review` | Eng Manager | Lock in architecture, edge cases, and tests. |
| **Design** | `/design-html` | Design Engineer | Convert mockups/descriptions to shippable HTML. |
| **Debugging** | `/investigate` | Debugger | Systematic root-cause analysis for bugs. |
| **Security** | `/cso` | Security Officer | OWASP/STRIDE security audit on the code. |
| **Testing** | `/qa` | QA Lead | Real browser testing and automated bug fixing. |
| **Review** | `/review` | Staff Engineer | Find complex bugs that pass standard CI. |
| **Shipping** | `/ship` | Release Engineer | Final audits, PR creation, and doc updates. |

---

## 🎨 Design & Frontend Skills

Use these commands to build and polish premium user interfaces.

*   **`/design-consultation`**: Researches the landscape and builds a complete design system.
*   **`/design-shotgun`**: Generates 4-6 UI variants so you can explore visual options.
*   **`/design-review`**: Audits live sites for visual "slop" and fixes alignment/spacing issues.

---

## 🌐 The "Agent with Eyes" (Browsing)

GStack provides a real Chromium browser for testing and data extraction.

*   **`/browse <url>`**: Ask the AI to visit a site and report on its content or behavior.
*   **`/open-gstack-browser`**: Launches a headed browser you can watch and interact with.
*   **`/setup-browser-cookies`**: Imports your real session cookies for testing authenticated flows.

---

## 🛡️ Safety & Power Tools

Tools for high-stakes environments and advanced control.

*   **`/guard`**: Activates Safety Mode (prevents destructive commands & locks file edits).
*   **`/freeze`**: Locks all files except the specific module you are working on.
*   **`/learn`**: Reviews the durable codebase "learnings" accumulated over time.
*   **`/codex`**: Gets a second opinion from OpenAI models for critical logic checks.

---

## 💡 How to Call Skills

Simply type the command at the start of your message:

> "**/office-hours** I want to build a crypto wallet for cats."
>
> "**/qa** Check if the checkout button works on https://staging.site.com"
>
> "**/investigate** The login is failing with a 500 error in the logs."

---

## 📱 Mobile Development (Android)

Freshon OS uses Tauri v2 for its mobile experience. Follow these steps to build or run the app on Android.

### 🛠️ Commands

| Action | Command | Description |
| :--- | :--- | :--- |
| **Run Dev Mode** | `npm run app:tauri android dev` `npx tauri android dev` | Hot-reloading dev environment on a device/emulator. |
| **Build Debug APK** | `npm run app:tauri android build -- --debug` | Generates a debug APK for testing. |
| **Build Release APK** | `npm run app:tauri android build` | Generates a signed release APK. |

### 🔧 Prerequisites

1.  **Android Studio**: Install Android Studio and ensure the SDK, NDK (v26+), and CMake are installed via the SDK Manager.
2.  **Environment Variables**: Ensure `ANDROID_HOME` points to your SDK location (e.g., `C:\Users\YourUser\AppData\Local\Android\Sdk`).
3.  **Rust Targets**: Add the Android targets if missing:
    ```bash
    rustup target add aarch64-linux-android armv7-linux-andriod i686-linux-android x86_64-linux-android
    ```

### 💡 Troubleshooting

*   **File Lock Error**: If the build fails with `os error 32` (file being used by another process), try running `npm run cargo -- clean` or restart your editor/terminal.
*   **API Connection**: Ensure `app/.env` is configured with your local machine's IP address so the mobile device can reach the backend.
*   **Gradle Daemon**: If Gradle hangs, try `.\gradlew --stop` in the `app/src-tauri/gen/android` directory.

git add .
git commit -m "update"
git push