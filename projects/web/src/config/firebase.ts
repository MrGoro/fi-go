import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getMessaging, isSupported } from "firebase/messaging";
import { firebaseOptions } from "./firebase-options";

const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true";

export const app = initializeApp(firebaseOptions);
export const auth = getAuth(app);

// Enable Auth development mode for local testing with phone numbers
if (import.meta.env.DEV) {
  auth.settings.appVerificationDisabledForTesting = true;
}

export const db = getDatabase(app);

// E2E mode: route Auth + Realtime Database to the local Firebase emulators.
// Gated by an env flag so production builds are never affected.
if (useEmulator) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectDatabaseEmulator(db, "127.0.0.1", 9000);
}

// Messaging is only available in browsers that support it (not iOS Safari < 16.4)
export const messagingPromise = isSupported().then((supported) =>
  supported ? getMessaging(app) : null
);

