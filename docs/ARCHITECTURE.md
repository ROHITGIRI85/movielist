# Architecture

## System context

IMovies uses a client-server architecture. The browser never connects directly to MongoDB and never decides whether a seat is truly available.

```text
Browser
  React + Bootstrap
        |
        | HTTPS / JSON REST API
        v
Express application
  routes -> middleware -> controllers -> services -> Mongoose models
        |
        v
MongoDB
```

A later deployment may place a CDN/static host before the client and a reverse proxy before the API. External email, media, monitoring, or payment services remain optional adapters rather than core domain logic.

## Repository structure

```text
frontend/
|-- public/             Static public files
|-- src/
|   |-- assets/         Imported images, fonts, and icons
|   |-- components/     Reusable presentational components
|   |-- context/        Cross-cutting React state providers
|   |-- hooks/          Reusable React hooks
|   |-- layouts/        Shared page shells
|   |-- pages/          Route-level screens
|   |-- routes/         Router and route guards
|   |-- services/       HTTP/API adapters
|   |-- styles/         Global styles and Bootstrap overrides
|   `-- utils/          Pure client helpers
`-- tests/              Client test support

backend/
|-- seeds/              Development seed data/scripts
|-- src/
|   |-- config/         Environment and infrastructure configuration
|   |-- controllers/    HTTP request/response coordination
|   |-- middleware/     Authentication, authorization, errors, validation
|   |-- models/         Mongoose schemas and indexes
|   |-- routes/         Versioned endpoint definitions
|   |-- services/       Business operations and transactions
|   |-- utils/          Pure server helpers
|   `-- validators/     Request schemas and validation rules
`-- tests/
    |-- integration/    API/database behavior
    `-- unit/           Isolated domain behavior
```

## Backend boundaries

- **Routes** map URLs and HTTP verbs, attach middleware, then call controllers.
- **Middleware** handles cross-cutting concerns such as authentication, role checks, request validation, rate limiting, and errors.
- **Controllers** translate HTTP input to service calls and format responses; they should not contain database-heavy business logic.
- **Services** own use cases such as holding seats or confirming a booking.
- **Models** describe persistence, constraints, and indexes.

Dependencies point inward toward services/domain rules. Models and external providers should be replaceable without changing HTTP handlers throughout the application.

## Frontend boundaries

- Pages compose feature components and initiate route-level data loading.
- Components receive explicit props and avoid hidden API calls where practical.
- Services are the only layer that knows the API base URL and raw HTTP client.
- Authentication state may use context; server state should remain distinct from local UI state.
- Route guards improve navigation but never replace server authorization.

## Booking consistency

Seat availability is concurrency-sensitive. The planned implementation will:

1. Represent each show seat with a status and optional hold expiry.
2. Use an atomic conditional database update to acquire requested seats only when all are available.
3. Give a hold a short expiry and booking reference.
4. Confirm only seats owned by that unexpired hold.
5. Release expired/failed holds through cleanup and opportunistic checks.
6. Enforce an appropriate unique/indexed constraint as a final safeguard.

The exact transaction strategy must be tested against the chosen MongoDB deployment because multi-document transactions require a replica set.

## Cross-cutting conventions

- API prefix: `/api/v1`
- JSON properties: `camelCase`
- MongoDB collections: plural lower-case names
- Stored timestamps: UTC using `createdAt` and `updatedAt`
- IDs exposed as strings
- Money: integer `amount` in minor units plus `currency`
- Success response: `{ "success": true, "data": ... }`
- Error response: `{ "success": false, "error": { "code": "...", "message": "...", "details": [] } }`

## Architecture decisions to revisit

- Access/refresh token storage and rotation details before authentication is implemented.
- Embedded show-seat inventory versus a dedicated inventory collection after load testing.
- Polling versus WebSocket/SSE updates after the correct transactional booking flow exists.
- Payment gateway selection and webhook handling only when real payment is in scope.

## MVC and supporting-service mapping

The backend follows an MVC-style REST design with an added service/integration boundary:

```text
Route (REST view) -> middleware -> controller -> service -> Mongoose model -> MongoDB
                                             |-> payment/notification adapter
                                             `-> optional Socket.io event
```

- Models contain schemas, indexes, and persistence behavior.
- Routes are the REST “view” named by the supplied MVC description.
- Controllers translate HTTP input/output.
- Services own reusable auth, catalogue, booking, payment, review, favorite, and notification rules.
- Integration adapters isolate Razorpay/Stripe/PayPal and email/SMS-specific code.
- Optional Socket.io events are published only after an authoritative MongoDB state change.

Admin is a `User` role rather than a separate credential model. Theater terminology maps to the existing Cinema and Screen models. See [Mentor Requirements and Project Decisions](MENTOR_REQUIREMENTS.md).
