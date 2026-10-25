# IMovies Detailed MERN Build Plan

## 1. Project in simple words

IMovies is a website for booking cinema tickets.

A customer will:

1. Create an account or sign in.
2. Browse movies.
3. Choose a cinema, date, and showtime.
4. See the seats for that show.
5. Select available seats.
6. Confirm the booking.
7. View or cancel eligible bookings later.

An administrator will add and update movies, cinemas, screens, showtimes, prices, and booking information.

## 2. MERN-only technology boundary

The application uses only the MERN stack as its core technology:

| Letter | Technology | Simple responsibility |
| --- | --- | --- |
| M | MongoDB | Stores users, movies, cinemas, shows, seats, and bookings |
| E | Express.js | Defines the API used by the React application |
| R | React.js | Builds everything the customer or administrator sees in the browser |
| N | Node.js | Runs the Express server and backend JavaScript |

Small npm packages can support the MERN application without becoming a separate technology stack. Examples include Mongoose for MongoDB models, JWT and bcrypt for login security, React Router for pages, and a CSS package for layout. The project will not introduce a separate SQL database, PHP/Java backend, Redis service, or another frontend framework.

The first release uses a simulated payment result. Connecting a real payment provider is outside the initial MERN build.

## 3. How the parts work together

```text
Customer's browser
      |
      v
React frontend
      |
      | JSON requests and responses
      v
Node.js + Express API
      |
      v
MongoDB database
```

- React displays pages and collects user actions.
- Express checks each request, applies the booking rules, and returns a response.
- MongoDB saves the permanent data.
- React never connects directly to MongoDB.
- The server, not the browser, makes the final decision about prices and seat availability.

## 4. Existing folders in simple words

### `frontend`

This is the React frontend.

| Folder | What belongs there |
| --- | --- |
| `src/assets` | Images, icons, and fonts imported by React |
| `src/components` | Small reusable UI pieces such as buttons, cards, and seat boxes |
| `src/context` | Shared React state, initially login information |
| `src/hooks` | Reusable React behavior |
| `src/layouts` | Common page structures such as customer and admin layouts |
| `src/pages` | Full pages such as Home, Login, Movie Details, and My Bookings |
| `src/routes` | Page URLs and protected-route rules |
| `src/services` | Functions that call the Express API |
| `src/styles` | Global styles and theme rules |
| `src/utils` | Small frontend helper functions |

### `backend`

This is the Node and Express backend.

| Folder | What belongs there |
| --- | --- |
| `src/config` | Environment and MongoDB connection configuration |
| `src/controllers` | Receives HTTP requests and sends responses |
| `src/middleware` | Login checks, admin checks, validation, and error handling |
| `src/models` | Mongoose definitions for MongoDB collections |
| `src/routes` | API URL definitions |
| `src/services` | Important business rules, including safe seat booking |
| `src/validators` | Checks request data before it is used |
| `src/utils` | Small backend helpers |
| `seeds` | Safe sample data for local development |
| `tests` | Backend unit and API integration tests |

### `docs`

This contains the plan and technical decisions. Update the documents whenever behavior or architecture changes.

## 5. Rules for every phase

Each phase must follow the same working cycle:

1. Move a prepared task from **Ready** to **In Progress** on the Kanban board.
2. Work on one small branch.
3. Implement only the acceptance criteria for that task.
4. Add tests for the new behavior.
5. Run linting and relevant tests.
6. Update documentation and `.env.example` when necessary.
7. Open a pull request, review it, and move the task to **Done** only after all checks pass.

Do not begin the next phase until the current phase exit checklist passes.

## Phase 1: Foundation and planning

**Goal:** Agree on what will be built and prepare an organized repository.

**Current status:** Completed locally. GitHub and demo links remain pending.

### Tasks

- Create the `frontend`, `backend`, `docs`, test, and GitHub template folders.
- Define the project requirements and user roles.
- Define the frontend/backend architecture.
- Plan API endpoints and response formats.
- Plan MongoDB collections, relationships, and indexes.
- Define security, testing, Git, and Kanban rules.
- Add environment templates without real secrets.
- Create the remote GitHub repository and add its URL to `README.md`.

### Output

- A clean repository structure.
- A shared written plan.
- No feature code yet.

### Exit checklist

- [x] Local folders and baseline documents exist.
- [x] JSON configuration files are valid.
- [x] Documentation links work.
- [ ] GitHub repository and Kanban board are created.
- [ ] GitHub URL is added to `README.md`.

## Phase 2: Backend foundation and user authentication

**Status:** Completed and verified with linting plus automated unit/integration tests.

**Goal:** Start the Node/Express server and create secure customer/admin access.

### Tasks

1. Add `backend/src/app.js` to configure Express without starting the network listener.
2. Add `backend/src/server.js` to validate configuration, connect MongoDB, and start the server.
3. Configure JSON parsing, CORS, security headers, request logging, and one centralized error handler.
4. Implement `GET /api/v1/health`.
5. Create the `User` Mongoose model with unique normalized email, password hash, role, and active state.
6. Implement registration with input validation and password hashing.
7. Implement login and short-lived JWT access tokens.
8. Implement refresh/logout using a separately protected refresh session.
9. Add `authenticate`, `requireRole`, and ownership middleware.
10. Implement current-profile read/update endpoints.
11. Add unit and integration tests for validation, authentication, and authorization.

### Output

- A running Express API connected to MongoDB.
- Customers can register, sign in, sign out, and view their profile.
- Admin routes can reject non-admin users.

### Exit checklist

- [x] The health endpoint reports API and database status.
- [x] Passwords are never stored or returned as plain text.
- [x] Invalid and expired tokens are rejected.
- [x] Customers cannot access admin-only test routes.
- [x] Authentication tests pass.
- [x] No secret is committed.

## Phase 3: Movie, cinema, screen, and show management

**Goal:** Build the catalogue and scheduling data needed before booking seats.

**Status:** Completed and verified locally. Phase 4 is next.

### Tasks

1. Create `Movie`, `Cinema`, `Screen`, and `Show` Mongoose models.
2. Add database indexes for movie slug/title, cinema location, and show searches.
3. Validate screen seat layouts and prevent duplicate seat labels.
4. Validate show start/end times and prevent overlapping active shows on one screen.
5. Build admin CRUD endpoints for movies.
6. Build admin CRUD endpoints for cinemas and screens.
7. Build admin endpoints to create, update, and cancel shows.
8. Build public endpoints to list/search/filter movies.
9. Build public endpoints to find cinemas and shows by movie, cinema, and date.
10. Create repeatable development seed data.
11. Add model and API integration tests.

### Output

- Admins can maintain the cinema catalogue and schedule.
- Customers can retrieve published movie and show information through the API.

### Exit checklist

- [x] Invalid movie, screen, and show data is rejected.
- [x] Public users cannot see unpublished or archived records.
- [x] Non-admin users cannot modify catalogue records.
- [x] Search and pagination behavior matches the API document.
- [x] Seed data can be loaded repeatedly in development.
- [x] Catalogue tests pass.

## Phase 4: Seat availability and booking engine

**Goal:** Implement the most important business rule: one show seat cannot be sold twice.

**Status:** Completed and verified locally. Phase 5 is next.

### Tasks

1. Create the `ShowSeat` inventory model with show, seat, price, status, hold owner, and hold expiry.
2. Create the `Booking` model with customer, show, seat snapshots, amount, currency, reference, and status.
3. Generate show-seat inventory when an admin schedules a show.
4. Implement the endpoint that returns current seat status for a show.
5. Implement an atomic seat-hold service that succeeds only when every requested seat is available.
6. Add a short expiry time to a hold.
7. Recalculate all prices on the server; ignore totals sent by the browser.
8. Implement booking confirmation using a simulated payment result.
9. Implement hold expiry and safe seat release.
10. Implement booking history and booking-detail endpoints.
11. Implement cancellation rules and seat release where allowed.
12. Add concurrency tests that send two requests for the same seat at the same time.

### Output

- Customers can hold, confirm, view, and cancel bookings.
- Conflicting requests produce one winner and a clear unavailable-seat response for the other request.

### Exit checklist

- [x] The database prevents duplicate show/seat inventory records.
- [x] Two customers cannot confirm the same show seat.
- [x] Expired holds cannot be confirmed.
- [x] Browser-modified prices do not change the server total.
- [x] Users cannot read or cancel another user's booking.
- [x] Booking and concurrency tests pass consistently.

## Phase 5: React foundation and account screens

**Goal:** Create the visible application shell and connect user accounts to the API.

**Status:** Completed and verified locally.

### Tasks

1. Add the React/Vite entry files and global styles.
2. Configure React Router.
3. Build the shared header, footer, customer layout, admin layout, loading state, empty state, and error state.
4. Create the API service with the backend base URL and consistent error handling.
5. Create the authentication context and safe session-refresh behavior.
6. Build Register, Login, Profile, Not Found, and Unauthorized pages.
7. Create protected customer and admin routes.
8. Make forms keyboard-friendly, labelled, and responsive.
9. Add component tests for forms, navigation, protected routes, and errors.

### Output

- A responsive React application.
- Customers can register, sign in, sign out, and edit allowed profile information from the browser.

### Exit checklist

- [x] Navigation works after page refresh.
- [x] Protected pages send signed-out users to login.
- [x] Admin pages reject ordinary customers in both React and Express.
- [x] Forms show useful validation and API errors.
- [x] Core screens work at mobile and desktop widths.
- [x] Account UI tests pass.

## Phase 6: React movie discovery and booking screens

**Goal:** Complete the customer's ticket-booking journey.

**Status:** Completed and verified locally.

### Tasks

1. Build the Home and Movies pages.
2. Build movie cards, search, filters, pagination, loading, and no-results states.
3. Build the Movie Details page.
4. Build cinema, date, and showtime selection.
5. Build an accessible seat map with available, held, booked, and selected states.
6. Display price breakdown and hold expiry clearly.
7. Build simulated checkout and confirmation pages.
8. Build My Bookings, Booking Details, and cancellation UI.
9. Handle unavailable seats by refreshing inventory and explaining what changed.
10. Add component and journey tests for the entire booking path.

### Output

- A customer can complete the full journey from movie discovery to booking confirmation.

### Exit checklist

- [x] Search and filters use the real Express API.
- [x] Seat status is understandable without relying only on color.
- [x] The UI cannot confirm an expired hold.
- [x] API conflicts refresh the seat map without losing the whole page.
- [x] Booking history shows correct server data.
- [x] The complete customer journey passes tests.

## Phase 7: React administration screens

**Goal:** Allow administrators to manage the system without directly editing MongoDB.

**Status:** Completed and verified locally.

### Tasks

1. Build an admin dashboard with basic counts and shortcuts.
2. Build movie list/create/edit/archive screens.
3. Build cinema and screen management screens.
4. Build the screen seat-layout editor with validation.
5. Build show scheduling/edit/cancellation screens.
6. Build the admin booking search/detail screen.
7. Add confirmation dialogs for important changes.
8. Test route protection, forms, errors, and successful admin workflows.

### Output

- Administrators can operate the first release through React screens.

### Exit checklist

- [x] Every admin action is protected by Express role checks.
- [x] Invalid schedules and seat layouts display helpful errors.
- [x] Changes appear correctly in public customer pages.
- [x] Admin UI tests pass.

## Phase 8: Full integration and quality review

**Status:** Automated review complete; current-Firefox manual journey pending because Firefox is not installed.

**Goal:** Make the complete MERN application dependable and ready to demonstrate.

### Tasks

1. Run all unit, integration, component, and main-journey tests.
2. Test account, movie, booking, cancellation, and admin journeys manually.
3. Test simultaneous seat requests repeatedly.
4. Check authorization for every protected endpoint.
5. Check mobile, tablet, and desktop layouts.
6. Check keyboard navigation, focus, labels, contrast, and image alternatives.
7. Check loading, empty, slow-network, expired-session, and server-error behavior.
8. Review API performance and MongoDB query indexes.
9. Review dependency, secret, CORS, logging, and error-handling safety.
10. Fix all release-blocking defects and update documentation.

### Output

- A tested release candidate with recorded verification results.

### Exit checklist

- [x] Linting and all automated tests pass.
- [x] No known double-booking path exists.
- [x] No critical authorization or secret issue remains.
- [x] Production client build completes.
- [ ] Main journeys work in current Chrome and Firefox.
- [x] Setup instructions work from a clean checkout.

## Phase 9: Deployment, demo, and mentor handoff

**Goal:** Publish the MERN application and make it easy to review.

### Tasks

1. Create a production MongoDB database and restricted application user.
2. Configure production environment values and strong secrets outside Git.
3. Deploy the Node/Express API.
4. Build and deploy the React frontend.
5. Configure the frontend API URL, backend CORS origin, HTTPS, and routing fallback.
6. Load safe demonstration data.
7. Run release smoke tests against the deployed system.
8. Add the live demo and GitHub URLs to `README.md` and the project workspace.
9. Prepare demo accounts, screenshots, known limitations, and a short walkthrough.
10. Tag the reviewed release and update `CHANGELOG.md`.

### Output

- Public GitHub repository.
- Working live demo.
- Mentor-ready documentation and walkthrough.

### Exit checklist

- [ ] HTTPS client and API are reachable.
- [ ] Production secrets are not present in source or logs.
- [ ] Registration, login, browsing, booking, history, and admin smoke tests pass.
- [ ] Demo data contains no real personal information.
- [ ] Demo and GitHub links are published.
- [ ] The release version and known limitations are documented.

## 6. Recommended build order inside a phase

For each feature, use this order:

```text
Requirement
  -> MongoDB model/index
  -> Express validation/service/API
  -> Backend tests
  -> React service/page/components
  -> Frontend tests
  -> Manual verification
  -> Documentation
```

This order keeps MongoDB and Express rules authoritative. It also prevents the frontend from being built around data that the backend cannot safely provide.

## 7. Final version checklist

The first version is complete only when:

- A customer can register, sign in, browse, select a show, reserve seats, confirm, and view the booking.
- An administrator can manage movies, cinemas, screens, and shows.
- The server prevents double booking and client-side price changes.
- Authentication, authorization, validation, and error handling are tested.
- The interface is responsive and keyboard usable.
- Setup, API, database, security, and release documents match the actual product.
- GitHub and live demo links are available for review.

## 8. Mandatory mentor-requirement additions

These items extend the tasks and exit checks of the phases above:

| Phase | Added mandatory work |
| --- | --- |
| 3 | Movie ratings summary, review-ready indexes, and theater/cinema naming consistency |
| 4 | Payment model/provider adapter, webhook verification, payment/refund states, cancellation/rescheduling rules, notification queue/log, and optional Socket.io only after atomic seat holds pass |
| 5 | Bootstrap/React-Bootstrap design system, Axios client, React Router v7, secure in-memory access-token handling, role-aware navigation |
| 6 | Watchlist, reviews/ratings, payment/confirmation, ticket, notification, cancellation, and rescheduling interfaces |
| 7 | User management, review moderation, payment/refund tools, booking support, and revenue reports |
| 8 | Payment replay/failure, notification retry, review abuse, Socket.io authorization, accessibility, and end-to-end tests |
| 9 | Selected payment/email/SMS providers, MongoDB Atlas, HTTPS, GitHub Actions, hosting, logs, error tracking, and release monitoring |

The decisions and full traceability are maintained in [Mentor Requirements and Project Decisions](MENTOR_REQUIREMENTS.md).
