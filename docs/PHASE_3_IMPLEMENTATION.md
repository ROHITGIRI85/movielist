# Phase 3 Implementation: Catalogue and Show Scheduling

## Status

Completed and verified.

## What was implemented

### MongoDB models

- `Movie` with title, stable slug, synopsis, runtime, release date, languages, genres, cast, crew, certification, media URLs, publication state, and review summary fields.
- `Cinema` (the physical Theater entity) with address, city, optional coordinates, timezone, contact details, amenities, and active state.
- `Screen` with a cinema reference, active state, and stable seat definitions containing label, row, number, category, and accessibility information.
- `Show` connecting a published movie to an active cinema/screen with start/end time, language, format, category pricing, booking window, and schedule state.
- `Review` schema and indexes prepared for the later ratings/review feature.

### Integrity rules

- Movie and cinema slugs are generated safely and uniquely.
- Public APIs return only published movies and active venue information.
- Screen seat labels and row/number positions must be unique.
- A screen must belong to the selected cinema.
- Only published movies and active cinemas/screens can be scheduled.
- Active shows on one screen cannot overlap.
- Prices are integer minor units with three-letter currency codes.
- Movie, city, date, schedule, rating, and review query indexes are defined.
- Deleting catalogue records means archive, deactivate, or cancel so history can remain valid.

## Implemented public endpoints

| Method | Endpoint | Purpose |
| --- | --- |
| GET | `/api/v1/movies` | Search/filter/paginate published movies |
| GET | `/api/v1/movies/:movieId` | Read a published movie by ID or slug |
| GET | `/api/v1/cinemas` | Filter/paginate active cinemas/theaters |
| GET | `/api/v1/cinemas/:cinemaId` | Read an active cinema by ID or slug |
| GET | `/api/v1/cinemas/:cinemaId/screens` | Read active public screen layouts |
| GET | `/api/v1/shows` | Filter/paginate scheduled shows |
| GET | `/api/v1/shows/:showId` | Read one public scheduled show |

Movie filters currently include `q`, `genre`, `language`, `minRating`, `sort`, `page`, and `limit`. Cinema filters include `city`, `page`, and `limit`. Show filters include `movieId`, `cinemaId`, `screenId`, `language`, `date`, `status` for admin access, `page`, and `limit`.

## Implemented admin endpoints

Every endpoint below requires a valid access token with the `admin` role.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET/POST | `/api/v1/admin/movies` | List all states or create a movie |
| GET/PATCH/DELETE | `/api/v1/admin/movies/:movieId` | Read, update, or archive a movie |
| GET/POST | `/api/v1/admin/cinemas` | List all states or create a cinema |
| PATCH/DELETE | `/api/v1/admin/cinemas/:cinemaId` | Update or deactivate a cinema |
| GET/POST | `/api/v1/admin/cinemas/:cinemaId/screens` | List or create screens |
| PATCH/DELETE | `/api/v1/admin/screens/:screenId` | Update or deactivate a screen |
| GET/POST | `/api/v1/admin/shows` | List or schedule shows |
| PATCH/DELETE | `/api/v1/admin/shows/:showId` | Update or cancel a show |

## Development seed

The repeatable seed contains one published sample movie, one Indore cinema, one 24-seat screen, and one scheduled show. It uses fixed IDs and replacement upserts, so rerunning it updates the same sample records rather than adding duplicates.

The seed refuses production and requires explicit confirmation:

```powershell
$env:SEED_CONFIRM='imovies-development'
npm run seed --workspace backend
```

It uses the configured `backend/.env` MongoDB connection. Never point a development seed command at important data.

## Verification performed

- ESLint: passed.
- Jest/Supertest: 5 suites and 24 tests passed.
- Integration tests run against an isolated temporary MongoDB instance.
- JavaScript syntax and package configuration validation passed.

## Intentionally deferred

- Per-show mutable seat inventory and temporary seat holds
- Bookings, payments, refunds, rescheduling, and notifications
- Review submission/moderation endpoints
- Favorites/watchlists
- Socket.io live seat events
- React catalogue and administration pages

Those features begin in the next phases after the catalogue and scheduling data is stable.

