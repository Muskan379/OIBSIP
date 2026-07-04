# To-Do App

A React Native (Expo) to-do list app with login/sign-up and per-user task storage saved locally on-device.

## Requirements

- [Node.js](https://nodejs.org) 18 or newer
- npm (comes with Node.js)
- The [Expo Go](https://expo.dev/go) app on your phone (to test on a physical device), or Android Studio / Xcode simulators

## Setup & Run

1. Unzip this folder and open a terminal inside it.
2. Install dependencies:

   ```
   npm install
   ```

3. Start the app:

   ```
   npx expo start
   ```

4. Scan the QR code shown in the terminal with the Expo Go app (Android) or the Camera app (iOS), or press `w` to open it in a web browser, `a` for an Android emulator, or `i` for an iOS simulator.

## Notes

- All data (accounts and tasks) is stored locally on the device using AsyncStorage — no backend/server is required.
- Passwords are hashed (SHA-256) before being stored; they are never saved in plain text.
