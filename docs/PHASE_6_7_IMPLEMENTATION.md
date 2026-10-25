# Phases 6 and 7: Customer Booking and Administration Frontend

## Status

Phases 6 and 7 are implemented and verified. The previously empty `frontend` workspace now also includes the Phase 5 foundation required by these screens: Vite, React Router, Bootstrap, Axios, authentication state, automatic session refresh, responsive layouts, feedback states, and protected routes.

## Customer experience

- Responsive home page and movie discovery.
- Real API search, genre/language filters, pagination, empty states, and retryable errors.
- Movie details and scheduled show selection.
- Accessible seat map that communicates availability with both text and visual state.
- Selection totals calculated from server-provided prices.
- Five-minute hold countdown and conflict recovery that refreshes inventory.
- Simulated payment success/failure with no card-data collection.
- Confirmation page, booking history, ticket details, and cancellation.
- Registration, login, logout, profile editing, session restoration, and protected customer routes.

## Administration experience

- Role-protected dashboard with catalogue and booking counts.
- Movie create, edit, publish/draft, and archive operations.
- Cinema create, edit, and deactivate operations.
- Screen layout generation, rename, and deactivate operations.
- Show create, edit, and cancel operations with backend validation messages.
- Booking reference/status search and operational details.

Express remains the final authorization and validation authority. React route guards improve navigation but never replace backend role checks.

## Frontend routes

| Area | Routes |
| --- | --- |
| Public | `/`, `/movies`, `/movies/:movieId`, `/login`, `/register` |
| Customer | `/profile`, `/shows/:showId/seats`, `/checkout/:bookingId`, `/bookings`, `/bookings/:bookingId` |
| Admin | `/admin`, `/admin/movies`, `/admin/cinemas`, `/admin/shows`, `/admin/bookings` |

## Verification

- Frontend ESLint passes.
- Five frontend test files and six tests pass.
- Production Vite build succeeds.
- The generated production bundle contains 107 transformed modules.
- Existing backend lint and 32 backend tests remain part of the full project verification.

## Intentional boundaries

- Checkout uses the Phase 4 payment simulator; real Razorpay, Stripe, or PayPal integration remains later work.
- Watchlists, review submission/moderation, notifications, revenue reports, and optional Socket.io updates remain later supplied-feature phases.
- Deployment and browser/device acceptance review remain Phases 8 and 9.
