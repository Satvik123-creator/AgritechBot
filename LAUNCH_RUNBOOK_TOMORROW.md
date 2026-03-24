# Anaaj AI Launch Runbook (Tomorrow)

This runbook is optimized for the agreed scope:
- Android APK distribution
- Production backend live
- Production website live
- Core flows verified: auth, notifications (in-app), marketplace, chat AI, voice

## 1. Pre-Launch Inputs (must be ready)

- Production domain + DNS access
- MongoDB production URI (with credentials)
- Redis production password
- JWT secret (64+ hex recommended)
- Gemini API key
- Sarvam API key
- Firebase Admin credentials via GOOGLE_APPLICATION_CREDENTIALS

## 2. Backend Deploy

Run from Backend folder.

### 2.1 Prepare env

1. Copy template:
   - cp .env.example .env
2. Set:
   - NODE_ENV=production
   - CORS_ORIGINS=https://anaaj.ai,https://www.anaaj.ai
   - JWT_SECRET=<strong-secret>
   - REDIS_PASSWORD=<strong-password>
   - MONGODB_URI=<production-uri>
   - GEMINI_API_KEY=<key>
   - SARVAM_API_KEY=<key>

### 2.2 Build and start services

- docker compose -f docker-compose.prod.yml up -d --build

### 2.3 Verify health

- curl http://localhost:4000/health
- curl http://localhost:4000/metrics

### 2.4 Seed production data

- docker compose -f docker-compose.prod.yml exec app npm run seed
- docker compose -f docker-compose.prod.yml exec app npm run kb:ingest

### 2.5 Functional smoke checks

- Auth OTP flow (send + verify)
- GET notifications list
- GET marketplace products
- POST chat ask
- POST voice ask

## 3. Website Deploy

Run from Website folder.

1. Build:
   - npm ci
   - npm run build
2. Deploy dist/ to your static host.
3. Verify:
   - favicon loads (/favicon.svg)
   - Features and Download nav links work
   - robots.txt and sitemap.xml are available

## 4. Mobile Android APK Build

Run from Mobile App folder.

1. Verify config:
   - app.json -> expo.extra.apiBaseUrl points to production backend
2. Validate types:
   - npm run typecheck
3. Build APK:
   - eas build --platform android --profile production
4. Install APK on real Android device and validate:
   - login OTP
   - chat response
   - voice response
   - marketplace listing
   - notifications list + mark-read

## 5. Release Acceptance Gate

All must pass:
- Backend /health and /metrics OK
- Website live without missing assets
- Android APK install + core flows pass
- No P0/P1 blocker in logs

## 6. Client Handoff Package

Send client:
- Website URL
- APK download link/file
- Backend base URL
- Known limitation note: push background notifications not included in this release
- Support contact for hotfix window
