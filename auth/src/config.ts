import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5055", 10),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  firebase: {
    apiKey: process.env.VITE_FIREBASE_API_KEY || "",
    // For server-side sign-in via Identity Toolkit REST API
  },
  adminKeyJson: process.env.FIREBASE_ADMIN_KEY_JSON || "",
  cookies: {
    name: "ma_session",
    // 5 days in milliseconds
    maxAgeMs: 5 * 24 * 60 * 60 * 1000,
  },
} as const;

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}


