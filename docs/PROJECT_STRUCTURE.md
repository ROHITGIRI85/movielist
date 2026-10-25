# Complete Planned Project Structure

This document is the file map for the finished IMovies MERN application. The directories exist now, but application files marked **future** must be created only in their assigned implementation phase.

The current repository is intentionally a no-code skeleton. Empty folders are tracked with `.gitkeep` files.

## Root structure

```text
imovies/
|-- .github/                 GitHub issue and pull-request templates
|-- .vscode/                 Shared editor recommendations
|-- frontend/                  React frontend
|-- backend/                  Node.js and Express backend
|-- postman/                 Future API test collections/environments
|-- docs/                    Project and technical documentation
|-- .editorconfig            Shared text formatting rules
|-- .gitignore               Files Git must ignore
|-- .nvmrc                   Shared Node.js version
|-- package.json             npm workspace configuration
|-- README.md                Main project introduction
|-- CONTRIBUTING.md          Contribution rules
|-- SECURITY.md              Vulnerability reporting policy
|-- CHANGELOG.md             Release history
`-- LICENSE                  Project license
```

## Complete frontend map

```text
frontend/
|-- public/
|   |-- images/                         Static browser images
|   |-- favicon.ico                     Future: browser icon
|   `-- manifest.json                   Future: application metadata if required
|-- src/
|   |-- app/
|   |   `-- App.jsx                     Implemented Phases 5-7: root routes/component
|   |-- routes/RouteGuards.jsx          Implemented Phase 5: auth/role guards
|   |-- setupTests.js                   Implemented Phase 5: Vitest DOM setup
|   |-- assets/
|   |   |-- icons/                      Imported icon assets
|   |   `-- images/                     Imported movie/UI images
|   |-- components/
|   |   |-- common/                     Buttons, cards, modal, pagination
|   |   |-- forms/                      Inputs, selects, form messages
|   |   |-- feedback/                   Loader, empty state, alerts, errors
|   |   |-- navigation/                 Header, footer, side navigation
|   |   |-- movies/                     Movie card, grid, filters
|   |   |-- shows/                      Date, cinema, and showtime selectors
|   |   |-- seats/                      Seat, legend, and seat-map components
|   |   |-- bookings/                   Summary, timer, price, status components
|   |   `-- admin/                      Reusable administration components
|   |-- constants/
|   |-- context/
|   |   `-- auth/
|   |       `-- AuthContext.jsx          Implemented Phase 5: auth state/session provider

|   |-- features/
|   |   |-- auth/                       Account-specific UI logic
|   |   |-- movies/                     Movie discovery UI logic
|   |   |-- cinemas/                    Cinema-selection UI logic
|   |   |-- shows/                      Showtime-selection UI logic
|   |   |-- bookings/                   Hold/confirmation/history UI logic
|   |   `-- admin/                      Administration UI logic
|   |-- hooks/
|   |-- layouts/
|   |   |-- customer/CustomerLayout.jsx Implemented Phase 5: public/customer shell
|   |   `-- admin/AdminLayout.jsx       Implemented Phase 7: admin shell
|   |-- pages/
|   |   |-- public/
|   |   |   |-- HomePage.jsx            Implemented Phase 6
|   |   |   |-- MoviesPage.jsx          Implemented Phase 6
|   |   |   |-- MovieDetailsPage.jsx    Implemented Phase 6
|   |   |   `-- StatusPages.jsx         Implemented Phase 5: not-found/unauthorized
|   |   |-- auth/
|   |   |   `-- AuthPage.jsx            Implemented Phase 5: login/register

|   |   |-- customer/
|   |   |   |-- ProfilePage.jsx         Implemented Phase 5
|   |   |   |-- SeatSelectionPage.jsx   Implemented Phase 6
|   |   |   |-- CheckoutPage.jsx        Implemented Phase 6
|   |   |   |-- BookingSuccessPage.jsx  Implemented Phase 6
|   |   |   |-- BookingsPage.jsx        Implemented Phase 6
|   |   |   `-- BookingDetailsPage.jsx  Implemented Phase 6
|   |   `-- admin/
|   |       |-- DashboardPage.jsx       Implemented Phase 7
|   |       |-- MoviesAdminPage.jsx     Implemented Phase 7

|   |       |-- CinemasAdminPage.jsx    Implemented Phase 7


|   |       |-- ShowsAdminPage.jsx      Implemented Phase 7

|   |       `-- BookingsAdminPage.jsx   Implemented Phase 7
|   |-- routes/
|   |   `-- RouteGuards.jsx              Implemented Phase 5: customer/admin guards

|   |-- services/
|   |   |-- http/
|   |   |   `-- httpClient.js           Implemented Phase 5: Axios/auth refresh/errors
|   |   `-- api/
|   |       `-- api.js                   Implemented Phases 5-7: all API adapters





|   |-- styles/
|   |   |-- base/                       Reset, variables, typography
|   |   |-- components/                 Shared component styling
|   |   `-- pages/                      Page-specific styling
|   |-- utils/
|   |   `-- format.js                   Implemented Phase 6: money/date formatting


|   |-- main.jsx                        Implemented Phase 5: React browser entry

|-- tests/
|   |-- components/                     Component tests
|   |-- integration/                    Connected React flow tests
|   |-- mocks/                          API response fixtures/mocks
|   `-- utils/                          Test render helpers
|-- .env.example                        Public frontend configuration example
|-- index.html                          Implemented Phase 5: Vite HTML entry
|-- eslint.config.js                    Implemented Phase 5: lint rules
|-- vite.config.js                      Implemented Phase 5: React build/test config
`-- package.json                        Frontend package definition
```

## Complete backend map

```text
backend/
|-- scripts/                            Future maintenance/migration scripts
|-- seeds/
|   |-- data/                           Safe development seed datasets
|   `-- seed.js                         Implemented Phase 3: guarded repeatable seed runner
|-- src/
|   |-- config/
|   |   |-- env.js                      Implemented Phase 2: validate environment
|   |   |-- database.js                 Implemented Phase 2: MongoDB connection
|   |   `-- logger.js                   Implemented Phase 2: safe logging setup
|   |-- constants/
|   |   |-- roles.js                    Implemented Phase 2
|   |   |-- booking.js                  Implemented Phase 4: booking, payment, and seat states
|   |   `-- showStatus.js               Implemented Phase 3
|   |-- controllers/
|   |   |-- auth/                       Register/login/session controllers
|   |   |-- users/                      Customer profile controllers
|   |   |-- movies/                     Movie controllers
|   |   |-- cinemas/                    Cinema/screen controllers
|   |   |-- shows/                      Show/inventory controllers
|   |   |-- bookings/                   Booking controllers
|   |   `-- admin/                      Admin reporting controllers
|   |-- jobs/
|   |   `-- releaseExpiredHolds.js      Implemented Phase 4: expired hold cleanup
|   |-- middleware/
|   |   |-- auth/                       Authentication, roles, ownership
|   |   |-- errors/                     Not-found and central error handlers
|   |   |-- security/                   Rate limits and security controls
|   |   `-- validation/                 Request validation middleware
|   |-- models/
|   |   |-- plugins/                    Shared schema behavior
|   |   |-- User.js                     Implemented Phase 2
|   |   |-- Movie.js                    Implemented Phase 3
|   |   |-- Cinema.js                   Implemented Phase 3
|   |   |-- Screen.js                   Implemented Phase 3
|   |   |-- Show.js                     Implemented Phase 3
|   |   |-- ShowSeat.js                 Implemented Phase 4
|   |   `-- Booking.js                  Implemented Phase 4
|   |-- routes/
|   |   |-- public/                     Health, movies, cinemas, shows
|   |   |-- protected/                  Profile and customer bookings
|   |   |-- admin/                      Catalogue/admin endpoints
|   |   `-- index.js                    Implemented Phase 2: versioned route mounting
|   |-- services/
|   |   |-- auth/                       Password/token/session rules
|   |   |-- catalogue/                  Movie/cinema/show business rules
|   |   |-- inventory/                  Seat creation/availability/hold rules
|   |   `-- bookings/                   Confirm/cancel/history rules
|   |-- utils/
|   |   |-- ApiError.js                 Implemented Phase 2: controlled API errors
|   |   |-- asyncHandler.js             Implemented Phase 2: async error forwarding
|   |   |-- pagination.js               Implemented Phase 3
|   |   |-- money.js                    Future payment integration helper
|   |   `-- bookingReference.js         Implemented Phase 4
|   |-- validators/
|   |   |-- auth/                       Account request schemas
|   |   |-- catalogue/                  Movie/cinema/show schemas
|   |   `-- bookings/                   Hold/confirm/cancel schemas
|   |-- app.js                          Implemented Phase 2: Express configuration
|   `-- server.js                       Implemented Phases 2/4: listener and hold-cleanup schedule
|-- tests/
|   |-- fixtures/                       Reusable safe test data
|   |-- helpers/                        Database/API test helpers
|   |-- integration/
|   |   |-- auth/                       Authentication API tests
|   |   |-- catalogue/                  Catalogue API tests
|   |   `-- bookings/                   Booking/concurrency API tests
|   `-- unit/
|       |-- middleware/                 Isolated middleware tests
|       |-- services/                   Isolated business-rule tests
|       `-- utils/                      Isolated helper tests
|-- .env.example                        Backend configuration example
|-- eslint.config.js                    Implemented Phase 2: lint rules
|-- jest.config.js                      Implemented Phase 2: test configuration
`-- package.json                        Backend package definition
```

## Postman map

```text
postman/
|-- collections/IMovies.postman_collection.json     Implemented review collection
`-- environments/IMovies Local.postman_environment.json  Safe local variable template
```

Postman files are optional review/testing artifacts. They do not replace automated tests and must never contain real tokens, passwords, or production secrets.

## Phase ownership summary

| Phase | Areas populated |
| --- | --- |
| 1 | Directories, configuration templates, documentation |
| 2 | Complete: Express entry/config, auth/user model, auth routes/controllers/services/tests |
| 3 | Complete: movie/cinema/screen/show models, catalogue APIs, seed data, and tests |
| 4 | Complete: show-seat inventory, holds, bookings, cleanup job, APIs, and concurrency tests |
| 5 | Complete: React/Vite entry, routing, layouts, authentication, API services, and tests |
| 6 | Complete: public discovery, seat selection, checkout, and customer bookings |
| 7 | Complete: dashboard and movie/cinema/screen/show/booking administration |
| 8 | Remaining integration tests, test fixtures, and quality configuration |
| 9 | Deployment configuration and Postman/release artifacts if required |

## Structure rules during implementation

- Do not create every planned file at once. Add a future file only when its phase begins.
- Keep request/response work in controllers and business decisions in services.
- Keep database definitions in models and request shape checks in validators.
- Keep browser API calls in frontend services, not scattered across components.
- Components should remain small; pages compose components into full screens.
- Tests should mirror the area they protect.
- Never replace a `.gitkeep` with code unrelated to that directory's purpose.
- Remove a `.gitkeep` when the first real tracked file is added to its directory.

## Mentor-aligned structure additions

The supplied feature set adds these prepared areas to the existing map:

```text
frontend/src/
|-- components/{favorites,payments,reviews,notifications}/
|-- features/{favorites,payments,reviews,notifications}/
`-- realtime/
    `-- socketClient.js                 Future optional authenticated Socket.io client

backend/src/
|-- controllers/{favorites,payments,reviews,notifications}/
|-- integrations/
|   |-- payments/                      Provider-neutral payment adapters
|   `-- notifications/                 Email/SMS provider adapters
|-- models/
|   |-- Payment.js                     Future real payment-gateway phase
|   |-- Review.js                      Implemented Phase 3 schema; APIs planned
|   |-- Favorite.js                    Future supplied-feature phase
|   `-- Notification.js                Future notification phase
|-- realtime/
|   `-- seatEvents.js                  Future optional Socket.io enhancement
|-- routes/{payments,reviews}/
|-- services/{favorites,payments,reviews,notifications}/
`-- validators/{payments,reviews}/
```

Payment, notification, and Socket.io vendor code must remain in adapters so core booking services can be tested without external networks. See [Mentor Requirements and Project Decisions](MENTOR_REQUIREMENTS.md).
