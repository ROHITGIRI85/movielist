# API Contract

## Conventions

- Base path: `/api/v1`
- Media type: `application/json`
- Authentication: bearer access token on protected routes
- Pagination query: `page` (default 1) and `limit` (bounded by the server)
- List metadata: `{ "page": 1, "limit": 20, "total": 42, "pages": 3 }`
- Validation errors use stable machine-readable codes and field details.

Example success:

```json
{
  "success": true,
  "data": {
    "id": "..."
  }
}
```

Example failure:

```json
{
  "success": false,
  "error": {
    "code": "SEATS_UNAVAILABLE",
    "message": "One or more selected seats are no longer available.",
    "details": [
      { "field": "seatIds", "value": "..." }
    ]
  }
}
```

## Endpoint inventory

**Implementation status:** health, authentication, profile, admin status, catalogue, seat inventory, and booking endpoints are implemented. Real payment-gateway, favorite, review, and notification endpoints remain planned for later phases.

### Health and authentication

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | /health | Public | Service/database readiness summary |
| GET | /admin/status | Admin | Verify API-level administrator authorization |
| POST | `/auth/register` | Public | Create a customer account |
| POST | `/auth/login` | Public | Issue access/refresh credentials |
| POST | `/auth/refresh` | Refresh credential | Rotate/renew a session |
| POST | `/auth/logout` | Authenticated | Revoke the current refresh session |
| GET | `/auth/me` | Authenticated | Return the current profile |
| PATCH | `/auth/me` | Authenticated | Update allowed profile fields |

### Movies and cinemas

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/movies` | Public | Search/filter/paginate published movies |
| GET | `/movies/:movieId` | Public | Read one published movie |
| POST | `/admin/movies` | Admin | Create a movie |
| PATCH | `/admin/movies/:movieId` | Admin | Update a movie |
| DELETE | `/admin/movies/:movieId` | Admin | Archive a movie |
| GET | `/cinemas` | Public | List/filter cinemas |
| GET | `/cinemas/:cinemaId` | Public | Read cinema and public screen details |
| POST | `/admin/cinemas` | Admin | Create a cinema |
| PATCH | `/admin/cinemas/:cinemaId` | Admin | Update a cinema |
| DELETE | `/admin/cinemas/:cinemaId` | Admin | Deactivate a cinema and cancel its future shows |
| GET | `/admin/cinemas/:cinemaId/screens` | Admin | List all screens for a cinema |
| POST | `/admin/cinemas/:cinemaId/screens` | Admin | Create a screen and seat layout |
| PATCH | `/admin/screens/:screenId` | Admin | Update a screen and seat layout |
| DELETE | `/admin/screens/:screenId` | Admin | Deactivate a screen and cancel its future shows |

### Shows and seat inventory

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/shows` | Public | Find shows by movie/cinema/date/language |
| GET | `/shows/:showId` | Public | Read show details |
| GET | `/shows/:showId/seats` | Public | Read current seat states and prices |
| POST | `/admin/shows` | Admin | Schedule a show |
| PATCH | `/admin/shows/:showId` | Admin | Update an eligible future show |
| DELETE | `/admin/shows/:showId` | Admin | Cancel an eligible show |

### Bookings

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/bookings/holds` | Customer | Atomically hold selected show seats |
| POST | `/bookings/:bookingId/confirm` | Customer | Confirm an owned, valid hold |
| GET | `/bookings` | Customer | List the customer's bookings |
| GET | `/bookings/:bookingId` | Owner/Admin | Read one booking |
| POST | `/bookings/:bookingId/cancel` | Owner/Admin | Cancel according to policy |
| GET | `/admin/bookings` | Admin | Search bookings across users/shows |

## Booking payload examples

Create a seat hold:

```json
{
  "showId": "66f000000000000000000001",
  "seatIds": [
    "66f000000000000000000101",
    "66f000000000000000000102"
  ]
}
```

The response includes the booking `id`, public `reference`, `status`, itemized server-priced seat snapshots, `total`, and `holdExpiresAt`. Confirmation accepts `paymentResult` as `success` or `failure`; this is a Phase 4 simulator and accepts no card details. The client must treat an expired hold as unavailable even if a stale screen still displays it.

## Status codes

| Status | Use |
| --- | --- |
| 200 | Successful read/update/action |
| 201 | Resource created |
| 204 | Successful response with no body |
| 400 | Malformed input or invalid state transition |
| 401 | Missing, invalid, or expired authentication |
| 403 | Authenticated but not authorized |
| 404 | Resource not found or not visible to requester |
| 409 | Uniqueness, seat conflict, or concurrent state conflict |
| 422 | Structurally valid request failing field/domain validation |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error with no internal detail exposed |

## Versioning rule

Breaking contract changes require a new major API path or a coordinated migration. Additive fields can be introduced within v1, and clients should ignore unknown response fields.

## Additional planned customer endpoints

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/favorites` | Customer | List the customer watchlist |
| POST | `/favorites/:movieId` | Customer | Add a movie to the watchlist |
| DELETE | `/favorites/:movieId` | Customer | Remove a movie from the watchlist |
| GET | `/movies/:movieId/reviews` | Public | List approved movie reviews |
| POST | `/movies/:movieId/reviews` | Customer | Create/update an eligible review |
| DELETE | `/movies/:movieId/reviews/me` | Customer | Remove the customer's review |
| POST | `/payments/orders` | Customer | Create a provider payment order for an owned valid hold |
| POST | `/payments/webhooks/:provider` | Provider signature | Verify a provider event idempotently |
| GET | `/bookings/:bookingId/payment` | Owner/Admin | Read sanitized payment state |
| POST | `/bookings/:bookingId/reschedule` | Owner/Admin | Reschedule when policy and inventory allow |
| GET | `/notifications` | Customer | List in-application notifications |
| PATCH | `/notifications/:notificationId/read` | Owner | Mark a notification read |

## Additional planned admin endpoints

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/admin/users` | Admin | Search users and account state |
| PATCH | `/admin/users/:userId/status` | Admin | Activate/deactivate according to policy |
| GET | `/admin/payments` | Admin | Search payment/refund records |
| POST | `/admin/bookings/:bookingId/refund` | Admin | Request an eligible idempotent refund |
| GET | `/admin/reviews` | Admin | Search pending/reported reviews |
| PATCH | `/admin/reviews/:reviewId/moderation` | Admin | Approve/hide a review with audit metadata |
| GET | `/admin/reports/revenue` | Admin | Return authorized revenue summaries |

Payment and webhook endpoints are provider-neutral at the controller/service boundary. Optional Socket.io events supplement these REST contracts for seat-state display; they do not replace them.
