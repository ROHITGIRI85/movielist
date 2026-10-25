# Phase 2 Implementation: Backend Foundation and Authentication

## Status

Completed and verified.

## What was implemented

### Express foundation

- `app.js` builds the Express application separately from the network listener, which makes API testing easier.
- `server.js` validates required configuration, connects to MongoDB, starts HTTP, and closes cleanly on shutdown.
- The API is versioned under `/api/v1`.
- Helmet, strict CORS, JSON size limits, cookie parsing, request logging, authentication rate limits, 404 handling, and centralized safe errors are configured.

### MongoDB user storage

- The `User` model stores name, normalized unique email, password hash, role, active state, timestamps, and hashed refresh sessions.
- Password hashes and refresh sessions are excluded from normal queries and JSON responses.
- Supported roles are `customer` and `admin`.

### Authentication and authorization

- Registration validates input, rejects duplicate email addresses, hashes the password, and starts a session.
- Login returns the same generic failure for unknown email or incorrect password.
- Short-lived access JWTs are returned to the client.
- Longer-lived refresh JWTs use a different secret, are delivered in an `HttpOnly` cookie, and are stored only as SHA-256 hashes in MongoDB.
- Refreshing rotates the refresh token so the previous token cannot be reused.
- Logout revokes the matching session and is safe to call more than once.
- Authentication middleware loads the active user for every protected request.
- Role and ownership middleware provide server-side authorization building blocks.
- Customers can read and update the allowed `name` and optional E.164 `phone` fields on their current profile; phone verification is deferred to the notification phase.

## Implemented endpoints

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/health` | Public | Report API and MongoDB readiness |
| POST | `/api/v1/auth/register` | Public, rate-limited | Register and start a session |
| POST | `/api/v1/auth/login` | Public, rate-limited | Sign in and start a session |
| POST | `/api/v1/auth/refresh` | Refresh cookie, rate-limited | Rotate the session and return a new access token |
| POST | `/api/v1/auth/logout` | Public, rate-limited | Revoke/clear the refresh session |
| GET | `/api/v1/auth/me` | Access token | Read the current profile |
| PATCH | `/api/v1/auth/me` | Access token | Update the current profile name and/or phone |
| GET | `/api/v1/admin/status` | Admin access token | Verify admin authorization |

## Important configuration

Copy `backend/.env.example` to `backend/.env`, then replace both JWT example secrets with different random values of at least 32 characters. `MONGODB_URI` must point to a reachable MongoDB database.

## Verification performed

- ESLint: passed.
- Jest/Supertest: 3 suites and 15 tests passed.
- Integration tests use an isolated in-memory MongoDB instance.
- Full npm dependency audit: passed with 0 known vulnerabilities.

Covered behavior includes input normalization, weak input rejection, database readiness, registration, private-field hiding, duplicate email conflict, login, invalid credentials, profile authorization/update, refresh rotation, idempotent logout, role enforcement, and reusable ownership authorization.

## What is intentionally not implemented yet

- Movie, cinema, screen, and show models/endpoints
- Seat inventory and booking behavior
- React application entry and pages
- Password reset/email verification
- Real payment integration
- Production deployment

These belong to later phases in the [Detailed MERN Build Plan](BUILD_PLAN.md).

