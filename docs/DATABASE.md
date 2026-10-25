# Database Design

**Implementation status:** `users`, `movies`, `cinemas`, `screens`, `shows`, `showseats`, `bookings`, and the review schema are implemented. Real payment records, favorites, and notifications are planned for their feature phases.

## Principles

- MongoDB is accessed only through the API.
- Mongoose schemas validate shape, while services enforce multi-record business rules.
- References are used for independently changing entities; compact historical snapshots are embedded in bookings.
- Every main collection uses timestamps.
- Deletion is normally archival when historical bookings depend on a record.

## Collections

### `users`

| Field | Notes |
| --- | --- |
| `name` | Trimmed display name |
| email | Normalized, unique, indexed |
| phone / phoneVerifiedAt | Optional unique E.164 number and future SMS verification timestamp |
| `passwordHash` | Never returned by default |
| `role` | `customer` or `admin` |
| `isActive` | Account access state |
| `refreshSessions` | Prefer hashed identifiers with expiry, or a separate collection if growth requires it |

### `movies`

Contains title, slug, synopsis, runtime minutes, release date, languages, genres, cast/crew summaries, certification, poster/backdrop/trailer URLs, and publication state. Index the slug uniquely and add a text/search strategy for title and descriptive fields.

### `cinemas`

Contains name, address, city, coordinates when enabled, timezone, contact details, amenities, and active state. Cinema timezone is an IANA identifier such as `Asia/Kolkata`.

### `screens`

References a cinema and contains a name/number plus seat layout. Each embedded seat definition has a stable ID, row label, number, category, and accessibility flags. A unique compound index prevents duplicate screen names within one cinema.

### `shows`

References a movie, cinema, and screen. Contains UTC start/end times, language, format, status, and category prices in minor units. A compound index supports queries by movie/cinema/start time. Scheduling validation prevents overlapping active shows on a screen.

### `showseats`

Represents mutable inventory for a show/seat pair when the dedicated-collection strategy is used.

| Field | Notes |
| --- | --- |
| `show` | Show reference |
| `seatId` | Stable seat ID from the screen snapshot |
| `label` / `category` | Display snapshot |
| `amount` / `currency` | Price snapshot in minor units |
| `status` | `available`, `held`, or `booked` |
| `holdToken` | Opaque hold owner/reference, not a user-facing secret |
| `holdExpiresAt` | TTL/business cleanup target |
| `booking` | Booking reference after allocation |

Create a unique compound index on `{ show: 1, seatId: 1 }`. Acquiring seats uses a conditional update and verifies that the modified count matches the requested count before success.

### `bookings`

| Field | Notes |
| --- | --- |
| `reference` | Unique human-facing random reference |
| `user` / `show` | Owner and show references |
| `status` | `held`, `confirmed`, `cancelled`, `expired`, or `refunded` |
| `seats` | Embedded labels, categories, and amounts at booking time |
| `subtotal`, `fees`, `total`, `currency` | Integer money snapshot |
| `holdExpiresAt` | Present during the hold stage |
| `confirmedAt`, `cancelledAt` | Lifecycle audit timestamps |
| `payment` | Provider-agnostic status/reference only; no card credentials |

## Relationship summary

```text
User 1 ---- * Booking * ---- 1 Show * ---- 1 Movie
                                  |
Cinema 1 ---- * Screen 1 --------+
                    |
                    * seat definitions

Show 1 ---- * ShowSeat ---- 0..1 Booking
```

## Integrity and concurrency

- Email, movie slug, booking reference, and show-seat compound uniqueness are database-enforced.
- Seat acquisition must be conditional and atomic; a preceding read is not sufficient.
- If a use case updates bookings and several inventory records together, use a MongoDB transaction on a replica-set deployment or redesign it as a safely recoverable state machine.
- Expired holds require both scheduled cleanup and runtime checks; TTL deletion alone is not an exact timer.
- Cancellation and confirmation are explicit allowed state transitions, not arbitrary status edits.

## Seed data

Development seed scripts will create deterministic sample users, movies, cinemas, screens, shows, and seat inventory. Seed scripts must refuse to run against production unless an explicit, separately reviewed override exists. No real personal data belongs in fixtures.

## Migration approach

Schema changes that cannot be handled compatibly require a versioned script, backup plan, dry run, and rollback/recovery notes. Changes are tested against representative non-production data before deployment.

## Additional supplied entities

### `payments`

References a booking and user and stores provider name, provider order/payment references, amount, currency, payment method category, status, verified timestamps, refund summary, and sanitized failure metadata. It never stores card numbers, CVVs, OTPs, or raw provider secrets. Provider event IDs/idempotency keys are unique where applicable.

### `reviews`

References a user and movie and stores rating, review text, moderation status, timestamps, and optional moderation metadata. A unique compound index on `{ user: 1, movie: 1 }` enforces one active review per customer/movie unless product rules later allow versions.

### `favorites`

References a user and movie. A unique compound index on `{ user: 1, movie: 1 }` prevents duplicate watchlist entries.

### `notifications`

Stores the user/booking relationship, channel (`in_app`, `email`, or `sms`), template/type, delivery status, provider reference, attempt timestamps, and sanitized error information. Notification failure does not reverse a confirmed booking.

### Admin representation

Admin is a role on the `users` collection, not a separate password-bearing collection. This avoids duplicate identity and session logic while preserving the supplied logical Admin entity.

The complete mapping of supplied ER terminology to physical MongoDB collections is documented in [Mentor Requirements and Project Decisions](MENTOR_REQUIREMENTS.md).
