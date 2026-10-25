# Testing Strategy

## Current status

The backend passes 8 Jest suites and 48 tests covering authentication, authorization, security headers, CORS, catalogue, inventory, three repeated concurrent-hold races, bookings, and cancellation. The frontend passes 7 Vitest files and 14 tests covering formatting, movie presentation, accessible seat behavior, signed-out/admin protection, all admin routes, and safe customer-route navigation. Linting, the Vite production build, dependency audit, live API/frontend checks, and responsive Chrome renders pass. A current-Firefox manual journey is still required; see [Phase 8 Quality Review](PHASE_8_QUALITY_REVIEW.md).

## Goals

Tests should protect user-visible behavior, security boundaries, and the seat-allocation rules most likely to fail under concurrency. The suite will be layered so most feedback is fast while a smaller set validates complete journeys.

## Test layers

| Layer | Planned tools | Focus |
| --- | --- | --- |
| Server unit | Jest | Pure validation, pricing, state transitions, utility behavior |
| Server integration | Jest, Supertest, isolated MongoDB | Routes, middleware, persistence, indexes, transactions |
| Client component | Vitest, React Testing Library | Rendering, accessibility, form interactions, error/loading states |
| End-to-end | To be selected before integration phase | Register/login, discover, select seats, confirm, retrieve booking |
| Manual exploratory | Browser and API client | Responsive layout, unusual workflows, cross-browser checks |

## Critical scenarios

- Registration rejects duplicate normalized email addresses.
- Invalid, expired, or revoked credentials cannot access protected routes.
- Customers cannot read or change another customer's booking.
- Non-admin users cannot call administrative endpoints.
- Search/filter/pagination use stable, documented behavior.
- Two concurrent requests for the same seat produce at most one successful hold/booking.
- Expired holds are rejected and become available again.
- The server recalculates prices and rejects tampered client totals.
- Booking confirmation and cancellation honor allowed state transitions.
- UI flows handle loading, empty, error, expired-hold, and retry states accessibly.

## Test data and isolation

- Automated tests use a dedicated ephemeral or isolated test database.
- Each test creates the minimum data it needs and does not depend on execution order.
- Clocks and external integrations are controlled when testing expiry or callbacks.
- No production credentials or personal data are used.

## Quality gates

Before a pull request merges:

1. Linting succeeds.
2. Relevant unit and integration tests succeed.
3. Changed behavior has test coverage or a documented reason it cannot be automated yet.
4. No focused/skipped tests are accidentally committed.
5. Documentation and API examples match behavior.

Coverage percentages can guide investigation but are not a substitute for scenario coverage. A numeric threshold will be selected after the first meaningful test suite exists.

## Release verification

Run a production build, full automated suite, database migration/seed dry run where relevant, accessibility smoke test, and the primary booking journey against a staging-like environment. Record the commit and environment used for the result.

## Supplied-feature test additions

Later suites must also verify watchlist uniqueness, review eligibility/moderation, payment signature verification, webhook replay/idempotency, payment failure seat release, refund state transitions, rescheduling conflicts, notification retry without duplicate booking, Socket.io authorization, and consistency between pushed seat events and authoritative REST/database state.
