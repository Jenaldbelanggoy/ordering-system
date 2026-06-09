# Ordering System App

A React Native mobile ordering system starter app with Google Cloud / Firebase backend integration.

## Project structure
- `src/App.tsx` — main app entry
- `src/screens` — UI screens
- `src/components` — reusable components
- `src/services/firebase.ts` — Firestore integration
- `functions/` — Google Cloud Function sample for order submission

## Setup
1. Install Node.js and npm if they are not already installed.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Add your Firebase configuration in `src/services/firebase.ts`.
4. Start the app:
   ```sh
   npm start
   ```

## Deployment
### Install on phone with Expo Go
- Install Node.js and npm if they are not installed.
- Run:
  sh
  npm install
  npm start
  
- Install the Expo Go app on your Android or iOS device.
- Open Expo Go and scan the QR code shown in the terminal or browser.
- The app will load on your phone for testing.

### Build a standalone APK or app bundle
- For a production install on Android, use Expo EAS build or Expo Classic build.
- Example with EAS:
  sh
  npx eas build -p android

- Follow Expo documentation to configure and publish the build.

### Backend deployment
- Install Firebase CLI globally:
  sh
  npm install -g firebase-tools
  
- Log in to Firebase:
  sh
  firebase login
  
- Initialize your Firebase Functions project if needed:
  sh
  firebase init functions
  
- Deploy the backend functions:
  sh
  firebae deploy --only functions
  

### Firebase Hosting (optional)
- If you want to deploy a web version, run:
  sh
  firebase deploy --only hosting
  

## VS Code Task
- Use the `Expo: Start` task from VS Code tasks to launch the app.
