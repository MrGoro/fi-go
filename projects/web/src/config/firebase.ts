import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getMessaging, isSupported } from "firebase/messaging";
import { firebaseOptions } from "./firebase-options";

export const app = initializeApp(firebaseOptions);
export const auth = getAuth(app);

// Enable Auth development mode for local testing with phone numbers
if (import.meta.env.DEV) {
  auth.settings.appVerificationDisabledForTesting = true;
}

export const db = getDatabase(app);

// Messaging is only available in browsers that support it (not iOS Safari < 16.4)
export const messagingPromise = isSupported().then((supported) =>
  supported ? getMessaging(app) : null
);

