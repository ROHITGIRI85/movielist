# Mentor Requirements and Project Decisions

## Purpose

This document records the project details supplied before the next phase and maps them to the IMovies implementation plan. It prevents a required feature from being lost while also resolving places where the source lists several alternative tools or older setup patterns.

## Technology decisions

The core application remains MERN:

- MongoDB for persistence
- Express.js for the REST API
- React.js for the browser application
- Node.js for the backend runtime

### Frontend selection

| Supplied option | Decision |
| --- | --- |
| React with Vite or Create React App | Use React with Vite. Vite is the selected build tool. |
| Bootstrap or Tailwind | Use Bootstrap. Do not combine two full CSS systems. |
| Bootstrap, React-Bootstrap, Material UI, Ant Design, MDB React UI Kit | Use Bootstrap and React-Bootstrap components where useful. Material UI, Ant Design, and MDB remain alternatives and will not be mixed into the same interface unless a later mentor requirement names a specific component. |
| Axios or Fetch | Use one shared Axios client so authentication and API errors are handled consistently. Native Fetch remains available but will not be mixed into ordinary feature services. |
| React Router | Use React Router for customer and admin navigation. |
| JWT in cookies or local storage | Keep short-lived access tokens in application memory and refresh tokens in `HttpOnly`, secure cookies. Do not put long-lived refresh credentials in local storage. |
| WebSockets / Socket.io | Add Socket.io only after atomic MongoDB seat locking is correct. It improves live display but is not the source of booking truth. |

Using all UI frameworks at once would duplicate components, increase download size, create conflicting themes, and make accessibility harder to maintain. The selected Bootstrap path still satisfies the supplied responsive-design requirement.

### Backend and infrastructure selection

| Area | Decision |
| --- | --- |
| API | Node.js and Express REST API under `/api/v1` |
| Architecture | MVC-style routes/controllers/models plus a service layer for reusable business rules |
| Database access | Mongoose with current connection defaults |
| Authentication | JWT, bcryptjs, refresh rotation, roles, ownership checks |
| Payments | Provider adapter; Razorpay is the initial candidate for the India-focused deployment, with Stripe/PayPal possible alternatives. Final provider approval occurs before the payment phase. |
| Notifications | Provider adapters for email and SMS; booking information remains retrievable in the application even if delivery fails. |
| Hosting | React static hosting, Node hosting, and MongoDB Atlas; exact vendors are selected during deployment. |
| CI/CD | GitHub Actions is the planned default because the repository will be hosted on GitHub. |
| Monitoring | Structured backend logs and error tracking; the exact hosted product is selected during deployment. |

## Important modernization notes

The supplied setup notes describe an `index.js`, `body-parser`, and Mongoose options such as `useNewUrlParser` and `useUnifiedTopology`. IMovies provides the same required behavior using current patterns:

- `backend/src/app.js` configures Express and `backend/src/server.js` connects MongoDB and starts listening. Separating them makes integration testing possible.
- `express.json()` replaces the separate `body-parser` package for JSON requests.
- Current Mongoose versions no longer require the old connection flags. The project uses `mongoose.connect(MONGODB_URI)`.
- The configured local example remains `mongodb://127.0.0.1:27017/imovies`.

## Roles and flows

### Customer

- Register, sign in, sign out, and manage a personal profile.
- Browse/search/filter movies by genre, language, location, rating, and date where applicable.
- View theaters/cinemas, screens, shows, prices, and live seat state.
- Temporarily hold seats and confirm a booking through payment.
- View tickets, booking history, upcoming shows, cancellations, eligible rescheduling, and refund state.
- Maintain a movie watchlist/favorites.
- Submit and manage ratings/reviews subject to moderation rules.
- Receive in-application status plus configured email/SMS confirmations and reminders.

### Administrator

- Manage users and roles without viewing passwords or credentials.
- Manage movies, theaters/cinemas, screens, seat layouts, and shows.
- Monitor seat inventory and booking state.
- Inspect payments, refunds, bookings, and revenue reports.
- Resolve supported booking issues.
- Moderate reviews.
- Monitor operational status and maintain platform integrity.

## Required customer journey

1. Customer registers or signs in.
2. Customer browses and selects a movie.
3. Customer chooses a location/theater, show, and seats.
4. The backend atomically places a temporary seat hold with an expiry.
5. Other clients receive updated availability through polling first and optional Socket.io later.
6. Customer chooses a supported payment method.
7. The backend creates/verifies the payment with the selected gateway.
8. Successful payment confirms the booking; failure or expiry releases the hold.
9. The system generates booking/ticket details and queues configured notifications.
10. Customer can view history, manage eligible reservations, maintain favorites, and review movies.

## Required administrator journey

1. Admin signs in through the same secure user system with the `admin` role.
2. Admin opens the protected dashboard.
3. Admin manages movies, theaters, screens, layouts, and schedules.
4. Admin monitors bookings, seat states, payments, refund status, users, and reports.
5. Admin moderates reviews and handles supported customer issues.

## Entity mapping

The supplied ER description names nine core logical entities. The MongoDB design represents them as follows:

| Supplied entity | IMovies persistence decision |
| --- | --- |
| User | `users` collection |
| Admin | A protected `admin` role on `users`, not duplicate credentials in a second collection |
| Movie | `movies` collection |
| Theater | `cinemas` collection; UI may display “Theater” based on project wording |
| Show | `shows` collection referencing movie, cinema, and screen |
| Seat | Stable seat definitions in screens plus mutable `showseats` inventory |
| Booking | `bookings` collection with immutable price/seat snapshots |
| Payment | `payments` collection with gateway references and status, never raw card data |
| Review | `reviews` collection referencing user and movie |

The supplied features also require favorites/watchlists. These use a `favorites` collection (or an indexed embedded form if later load testing justifies it). Notifications use a `notifications` collection or delivery log when provider integration begins.

## Requirement traceability

| Requirement | Planned phase | Main areas |
| --- | --- | --- |
| Registration, login, logout, JWT, roles | Complete | Auth routes/services/model/tests |
| Profile management | Complete baseline; extend later | User profile endpoints/frontend |
| Movie listings and filters | Catalogue backend + customer frontend | Movie model/API/pages |
| Theater, screen, and show management | Catalogue backend + admin frontend | Cinema/Screen/Show models and admin pages |
| Real-time seat availability | Booking engine; optional Socket.io enhancement | ShowSeat service and realtime adapters |
| Booking history, cancellation, reschedule | Booking backend + customer frontend | Booking service/API/pages |
| Secure payments and transaction history | Booking/payment phase | Payment model/service/provider adapter |
| Watchlist/favorites | Customer features phase | Favorite model/API/UI |
| Reviews and ratings | Catalogue/customer/admin phases | Review model/API/UI/moderation |
| Admin user management and reports | Admin phase | Protected admin API/pages |
| Email/SMS confirmations and reminders | Notification phase within booking/release work | Notification service/provider adapters |
| CI/CD, hosting, monitoring | Deployment phase | GitHub Actions, hosts, Atlas, logs/error tracking |
| HTTPS, validation, hashing, rate limits | Partially complete; reviewed every phase | Express middleware and deployment |

## Acceptance rule

A later feature is not complete merely because its UI exists. Its MongoDB model/indexes, Express validation and authorization, service rules, React workflow, failure states, tests, and documentation must all be complete together.

