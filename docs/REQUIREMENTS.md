# Product Requirements

## Purpose

IMovies reduces the effort and uncertainty involved in reserving cinema tickets. Customers should be able to find a suitable show, see current seat availability, reserve seats safely, and retrieve their booking later.

## Users and roles

| Role | Main capabilities |
| --- | --- |
| Guest | Browse/search movies, cinemas, and public show details; register and sign in |
| Customer | Perform guest actions, choose seats, create/cancel eligible bookings, and view booking history |
| Administrator | Manage the movie catalogue, cinemas, screens, shows, pricing, and booking records |

## Functional requirements

### Accounts and access

- Users can register with a unique email address and securely stored password.
- Users can sign in, refresh a session, sign out, and view/update their profile.
- Protected operations require authentication; administrative operations also require the admin role.

### Discovery

- Users can browse now-showing and upcoming movies.
- Users can search and filter by title, language, genre, date, and cinema where applicable.
- Movie detail pages display metadata, poster/backdrop references, synopsis, runtime, certification, and available shows.

### Shows and seats

- Users can select a cinema, date, showtime, and available seat.
- A screen has a stable seat layout; each show has pricing and availability for those seats.
- The server is the authority on availability and prevents two confirmed bookings for the same show and seat.

### Booking management

- A customer can create a pending booking, confirm it after successful payment handling, view it, and cancel it when policy allows.
- A booking records an immutable pricing snapshot so later price edits do not change history.
- The first release may use a simulated payment result; a real payment provider requires a separate design and security review.

### Administration

- Admins can create, update, publish, or archive movies.
- Admins can manage cinemas, screens, seat layouts, shows, and prices.
- Admins can inspect bookings without seeing stored plaintext passwords, tokens, or full payment credentials.

## Non-functional requirements

- Responsive layouts support modern desktop and mobile browsers at widths from 360 px upward.
- Core flows are usable with a keyboard, visible focus, semantic HTML, labelled inputs, and meaningful image alternatives.
- API responses use a consistent JSON envelope and stable HTTP status semantics.
- Secrets remain server-side and out of version control.
- Passwords are hashed; authentication endpoints are rate-limited.
- Booking writes are atomic and idempotency is considered for confirmation/payment callbacks.
- Logs provide useful operational context without recording passwords, tokens, or sensitive payment data.
- Automated tests cover critical authentication, authorization, availability, and booking rules.

## Constraints and assumptions

- Phase 1 creates structure and documentation, not a runnable application.
- Prices use integer minor units (for example, paise) plus an ISO 4217 currency code; floating-point money is avoided.
- Dates are stored in UTC and converted to a cinema's IANA timezone for display.
- Poster and trailer media are stored as external URLs in the initial release.
- Email delivery and real payment processing are out of scope until separately configured.

## Initial acceptance journey

1. A guest finds a movie and a show.
2. The guest signs in or creates an account.
3. The customer selects currently available seats.
4. The server verifies and temporarily holds the requested seats.
5. The booking is confirmed after the configured payment step.
6. The customer sees a booking reference and can retrieve it from booking history.

## Success measures

- A customer completes the main journey without administrative help.
- Conflicting attempts cannot produce two active bookings for the same show seat.
- Critical API and UI journeys pass automated tests before release.
- A new contributor can configure the project from the setup guide without undocumented steps.

## Mentor-aligned feature additions

The following supplied requirements are mandatory additions to the earlier baseline:

- Customers can maintain a watchlist/favorites and view relevant history.
- Eligible customers can create ratings/reviews for movies; administrators can moderate them.
- Bookings track payment initiation, verification, failure, refund, and reconciliation state through a provider adapter.
- Cancellation and rescheduling eligibility are calculated by the backend from show time and policy.
- Confirmations, ticket details, receipts, reminders, and important status changes can be delivered through configured email/SMS adapters while remaining visible in the application.
- The admin dashboard includes user management, review moderation, payment/refund visibility, booking support, and revenue/report summaries.
- Seat changes use atomic MongoDB rules. Optional Socket.io events improve live displays but never decide ownership of a seat.

The canonical interpretation and phase mapping are in [Mentor Requirements and Project Decisions](MENTOR_REQUIREMENTS.md).
