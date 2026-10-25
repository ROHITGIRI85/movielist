# Phase 4: Seat Inventory and Booking Engine

## Status

Phase 4 is implemented and verified. The backend now creates per-show seat inventory, prevents double allocation, manages expiring holds, confirms simulated payments, and supports booking history and cancellation.

## What was implemented

- `ShowSeat` inventory records are created automatically from the selected screen whenever an admin creates a show.
- `{ show, seatId }` has a unique database index, so duplicate inventory is rejected.
- Public users can read sanitized live seat states at `GET /api/v1/shows/:showId/seats`.
- Authenticated customers can hold 1-10 seats for five minutes.
- Seat acquisition uses conditional database updates. A competing request cannot acquire a seat that is already held or booked.
- Seat IDs, prices, currency, subtotal, fees, and total are calculated by the backend. Client totals are ignored.
- Customers confirm a hold with a simulated `success` or `failure` payment result.
- Successful confirmation marks the inventory booked; failure releases it.
- Runtime checks and a periodic cleanup job expire stale holds safely.
- Customers can list, read, and cancel their own bookings. Administrators can list all bookings and can use owner-or-admin booking actions.
- Cancellation releases held or booked seats when the show has not started. Refund processing is intentionally deferred to the real payment phase.

## Main endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/v1/shows/:showId/seats` | Public |
| POST | `/api/v1/bookings/holds` | Authenticated |
| POST | `/api/v1/bookings/:bookingId/confirm` | Owner/Admin |
| GET | `/api/v1/bookings` | Authenticated customer |
| GET | `/api/v1/bookings/:bookingId` | Owner/Admin |
| POST | `/api/v1/bookings/:bookingId/cancel` | Owner/Admin |
| GET | `/api/v1/admin/bookings` | Admin |

Confirmation example:

```json
{
  "paymentResult": "success",
  "transactionReference": "optional-simulated-reference"
}
```

No card details are accepted or stored. Real Razorpay, Stripe, or PayPal integration belongs to a later payment phase.

## Hold cleanup

The default hold duration is five minutes. The server runs cleanup every 60 seconds, configurable with `HOLD_CLEANUP_INTERVAL_MS`. Every seat read, confirmation, and booking-list operation also applies expiry rules, so correctness does not depend only on the timer.

## Verification

- Backend lint passes.
- Seven Jest suites and 32 tests pass.
- Tests cover unique inventory, server-authoritative pricing, simultaneous requests for one seat, confirmation, expiry, ownership, cancellation, and simulated payment failure.

## Next phase

Phase 5 creates the React/Vite application foundation and authentication screens in the `frontend` workspace.
