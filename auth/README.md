## MusicAssist Auth (Firebase)

This folder provides a self-contained authentication service and client wrapper using Firebase. It does not modify existing frontend folders.

### Features
- Email/password signup and login using Firebase Web SDK on the client
- Server issues secure HTTP-only session cookies via Firebase Admin
- Endpoints: `/session/login`, `/session/logout`, `/session`

### Setup
1. Create a Firebase project and enable Email/Password auth.
2. Generate a Service Account key (JSON) from Firebase console and copy its JSON into `FIREBASE_ADMIN_KEY_JSON`.
3. Copy `.env.example` to `.env` and fill all values.

### Dev
```
pnpm install
pnpm dev
```

The server listens on `http://localhost:5055`. Configure your frontend to proxy `/session/*` to this server in dev, or deploy both behind the same domain.

### Deployment
- Use environment variables shown in `.env.example`.
- Ensure cookies are set with `Secure` (automatic when `NODE_ENV=production`).
- Serve the auth server under the same top-level domain as the frontend to allow cookies.


