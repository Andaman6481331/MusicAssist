import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config, isProduction } from "./config";
import { getAuth } from "./firebaseAdmin";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);

// Health
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Verify ID token from client and set a session cookie
app.post("/session/login", async (req, res) => {
  const idToken: string | undefined = req.body?.idToken;
  if (!idToken) {
    return res.status(400).json({ error: "Missing idToken" });
  }
  try {
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(idToken);
    const expiresInMs = config.cookies.maxAgeMs;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: expiresInMs });

    res.cookie(config.cookies.name, sessionCookie, {
      httpOnly: true,
      secure: isProduction(),
      sameSite: "lax",
      maxAge: expiresInMs,
      path: "/",
    });
    res.json({ uid: decoded.uid, email: decoded.email || null });
  } catch (err) {
    res.status(401).json({ error: "Invalid idToken" });
  }
});

// Clear the session cookie
app.post("/session/logout", (_req, res) => {
  res.clearCookie(config.cookies.name, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
  });
  res.json({ ok: true });
});

// Check current session
app.get("/session", async (req, res) => {
  const cookie = req.cookies?.[config.cookies.name];
  if (!cookie) {
    return res.status(401).json({ authenticated: false });
  }
  try {
    const auth = getAuth();
    const decoded = await auth.verifySessionCookie(cookie, true);
    res.json({ authenticated: true, uid: decoded.uid, email: decoded.email || null });
  } catch {
    res.status(401).json({ authenticated: false });
  }
});

app.listen(config.port, () => {
  console.log(`Auth server listening on http://localhost:${config.port}`);
});


