# Security Design

The backend implements password hashing, separately signed access/refresh JWTs, rotating refresh sessions, secure refresh cookies, rate limiting, validation, security headers, strict CORS, safe errors, role/ownership checks, conflict-safe seat allocation, hidden hold tokens, and server-authoritative booking prices. Real payment-gateway, deployment, and operational controls remain planned for their phases.

## Authentication

- Hash passwords with a reviewed adaptive password-hashing library and configurable cost; never store or log plaintext passwords.
- Use short-lived access tokens and separately signed, longer-lived refresh credentials.
- Rotate refresh credentials and support server-side revocation/session invalidation.
- Keep signing keys outside source control and use distinct secrets per environment and token purpose.
- Return generic login/reset failures so account existence is not disclosed unnecessarily.

The team must decide whether refresh credentials use secure, `HttpOnly`, `SameSite` cookies or another carefully reviewed approach before implementation. Browser local storage is not the default location for long-lived credentials.

## Authorization

- Authenticate and authorize every protected API request on the server.
- Check resource ownership for customer bookings; hiding UI controls is not authorization.
- Restrict catalogue, scheduling, and cross-user booking operations to admins.
- Deny by default when a role or ownership condition is unclear.

## Input and API protection

- Validate body, route, and query input against allowlisted schemas.
- Reject unknown or dangerous fields in updates to prevent mass assignment.
- Configure Helmet, strict CORS origins, JSON size limits, and rate limits.
- Escape or safely render user-controlled text; React escaping does not make arbitrary HTML safe.
- Do not expose stack traces, database internals, or tokens in production responses.
- Use HTTPS in every deployed environment that handles credentials.

## Booking and payment protection

- Treat prices, discounts, seat status, and totals from the client as untrusted hints; calculate authoritative values on the server.
- Use atomic seat allocation and explicit booking state transitions.
- Make confirmation/payment callbacks idempotent and verify any provider signature.
- Never store card numbers, CVVs, or raw provider secrets. Real payment work requires provider documentation and a dedicated threat review.

## Data and operational safety

- Grant the database user only required permissions and restrict network access.
- Redact authorization headers, credentials, reset data, personal information, and payment details from logs.
- Back up production data, encrypt backups, define retention, and periodically test restoration.
- Keep dependencies reviewed and patched; CI should run dependency and secret checks.
- Use separate development, test, and production databases.

## Pre-release security checklist

- [ ] Authentication/session design is documented and tested.
- [ ] Object-level and role-level authorization tests pass.
- [ ] Brute-force protection and rate-limit behavior are verified.
- [ ] Secrets are provided by the environment and absent from Git history.
- [ ] CORS and cookie policies match the deployed origins.
- [ ] Booking concurrency tests show no double booking.
- [ ] Logs and errors reveal no sensitive values.
- [ ] Dependency and secret scans have no unresolved high-severity findings.

## External integration controls

- Payment callbacks require provider signature verification, idempotent event storage, server-calculated amounts, and explicit booking/payment state transitions.
- No raw payment credential or card data is stored by IMovies.
- Email/SMS content contains the minimum required personal data; provider keys stay in secret storage.
- Socket.io connections authenticate and authorize subscriptions; a client event can never directly mark a seat booked.
- Review text is treated as untrusted content and rendered without arbitrary HTML.
- Admin user, refund, moderation, and reporting actions require role checks and audit metadata.
