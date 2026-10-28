# Changelog

All notable changes to IMovies will be recorded here. The format follows Keep a Changelog and the project intends to use semantic versioning.

## [Unreleased]

### Fixed

- Prevented customer booking pages from returning Promise values as React effect cleanup functions.
- Restricted credentialed CORS responses to the configured frontend origin.
- Added compound booking and seat-status indexes for common list/filter queries.

- Aligned the documented and CI Node.js baseline with Vitest's supported Node 22.13+ runtime.
- Added version-matched Rolldown and Lightning CSS Linux bindings required by clean Ubuntu installs and GitHub Actions.
- Made integration tests wait for MongoDB indexes before exercising uniqueness constraints, removing clean-environment race conditions.

- Corrected admin page effects that returned promises as React cleanup functions, which caused navigation and unmount crashes.
- Added visible request failure handling and retry support across the admin dashboard and management actions.
- Pinned the Vite development port so a second server cannot silently start on a CORS-incompatible origin.

### Added

- Redesigned the interface with a midnight-cinema theme using warm gold actions, teal selection states, richer surfaces, and clearer interactive feedback.

- GitHub Actions continuous integration and repository line-ending rules.

- Expanded development catalogue with six published movies, six scheduled shows, and generated seat inventories.
- Added route-level coverage for all five protected admin pages.
- Docker Compose MongoDB, root database/seed/verification commands, secure ignored local environment configuration, and repeatable demo accounts.
- Safe Postman collection and local environment template without committed credentials.
- Real HTTP smoke verification for frontend delivery, database health, customer booking lifecycle, and admin authorization.

- React/Vite application foundation with Bootstrap styling, Axios services, automatic session refresh, responsive layouts, feedback states, and protected routes.
- Customer movie discovery, filters, show selection, accessible seat map, hold countdown, simulated checkout, booking history/details, and cancellation screens.
- Admin dashboard plus movie, cinema, screen, show, and booking management screens backed by the real Express APIs.
- Frontend component/route tests and a verified production build.

- Phase 4 show-seat inventory with database uniqueness, sanitized public availability, and automatic creation during show scheduling.
- Conflict-safe five-minute seat holds, server-authoritative pricing, simulated confirmation, booking history, owner/admin access, cancellation, and expiry cleanup.
- Booking validation plus integration tests for concurrency, expiry, ownership, payment outcomes, and seat release.
- Renamed the application workspaces to `frontend` and `backend` for a clearer project structure.

- Movie, cinema, screen, show, and review Mongoose schemas with catalogue indexes and validation.
- Public catalogue discovery and admin-only movie, cinema, screen, and show management APIs.
- Show overlap protection, reference consistency checks, soft deactivation/cancellation behavior, pagination, search, and filters.
- Guarded, repeatable development catalogue seed data and Phase 3 catalogue test coverage.

- Express API foundation with environment validation, MongoDB connection, health reporting, safe errors, and graceful shutdown.
- Secure user registration, login, refresh rotation, logout, name/phone profile management, and role/ownership authorization.
- Jest/Supertest authentication tests backed by an isolated in-memory MongoDB instance.
- Mentor requirement traceability covering payments, real-time seats, favorites, reviews, notifications, admin reporting, and deployment.
- Expanded frontend/backend placeholders for those later-phase modules.
- Initial MERN workspace structure.
- Phase 1 product, architecture, setup, API, database, security, testing, workflow, and roadmap documentation.
- Environment variable templates and community files.

