import admin from "firebase-admin";
import { config } from "./config";

let initialized = false;

export function getAdminApp(): admin.app.App {
  if (initialized && admin.apps.length > 0) {
    return admin.app();
  }

  if (!config.adminKeyJson) {
    throw new Error("FIREBASE_ADMIN_KEY_JSON is not set");
  }

  let credentials: admin.ServiceAccount | undefined;
  try {
    credentials = JSON.parse(config.adminKeyJson);
  } catch (e) {
    throw new Error("FIREBASE_ADMIN_KEY_JSON must be a valid JSON string of the service account");
  }

  admin.initializeApp({
    credential: admin.credential.cert(credentials as admin.ServiceAccount),
  });
  initialized = true;
  return admin.app();
}

export function getAuth() {
  return getAdminApp().auth();
}


