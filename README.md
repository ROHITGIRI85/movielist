# IMovies

Movie ticket booking made simple.

IMovies is a planned MERN web application where customers can discover movies, compare showtimes, select available seats, and manage reservations. The system will use a React client, an Express/Node.js REST API, and MongoDB, with JWT-based authentication and real-time seat-availability safeguards.

> Current status: Phase 8 automated integration and quality review passes. React users can discover movies, select seats, complete simulated checkout, manage bookings, and use JWT role-protected administration screens. A current-Firefox manual pass remains before Phase 8 closes; deployment and mentor links follow in Phase 9.

## Project links

- Live demo: _To be added after deployment_
- GitHub repository: [ashvin94/Imovies](https://github.com/ashvin94/Imovies)
- Kanban board: _To be added_

## Planned features

- Browse and search currently available and upcoming movies.
- View cinemas, screens, showtimes, pricing, and seat layouts.
- Register, sign in, and maintain a secure customer profile.
- Reserve seats with server-side availability and conflict checks.
- Review booking history and cancel or reschedule eligible bookings.
- Maintain a watchlist and submit movie ratings/reviews.
- Complete provider-backed payments and track payment/refund status.
- Receive in-application and configured email/SMS booking notifications.
- Administer movies, cinemas, screens, shows, and bookings.
- Provide responsive, accessible pages with Bootstrap.

## Technology

The core application stack is MERN only:

| MERN part | Responsibility |
| --- | --- |
| MongoDB | Stores application data |
| Express.js | Provides the REST API |
| React.js | Builds the browser interface |
| Node.js | Runs the backend |

Supporting npm libraries provide authentication, routing, styling, validation, and testing without introducing a second application stack or database.

## Repository layout

```text
imovies/
|-- frontend/             React application
|-- backend/             Express API and database layer
|-- docs/               Technical and project documentation
|-- .github/            Issue and pull-request templates
|-- package.json        npm workspace configuration
`-- README.md           Project entry point
```

Detailed folder responsibilities are documented in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Getting started

Both the Express API and React application are runnable. Local Docker MongoDB configuration, repeatable demo data, tests, and production builds are available. Follow [docs/SETUP.md](docs/SETUP.md) for the complete workflow.

## Documentation

- [Product requirements](docs/REQUIREMENTS.md)
- [Mentor requirements and project decisions](docs/MENTOR_REQUIREMENTS.md)
- [Complete project structure](docs/PROJECT_STRUCTURE.md)
- [Detailed MERN build plan](docs/BUILD_PLAN.md)
- [Phase 2 backend implementation](docs/PHASE_2_IMPLEMENTATION.md)
- [Phase 3 catalogue implementation](docs/PHASE_3_IMPLEMENTATION.md)
- [Phase 4 booking implementation](docs/PHASE_4_IMPLEMENTATION.md)
- [Phases 6 and 7 frontend implementation](docs/PHASE_6_7_IMPLEMENTATION.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Setup and configuration](docs/SETUP.md)
- [API contract](docs/API.md)
- [Database design](docs/DATABASE.md)
- [Security](docs/SECURITY.md)
- [Testing strategy](docs/TESTING.md)
- [Phase 8 quality review](docs/PHASE_8_QUALITY_REVIEW.md)
- [Delivery roadmap](docs/ROADMAP.md)
- [Git workflow](docs/GIT_WORKFLOW.md)
- [Contribution guide](CONTRIBUTING.md)

## Project phases

1. Structure and documentation (complete)
2. Backend foundation and authentication (complete)
3. Catalogue and database development (complete)
4. Seat inventory and booking engine with simulated payment (complete)
5. React foundation and account screens (complete)
6. Customer booking and admin frontend (complete)
7. React administration screens (complete)
8. Full integration and quality review (automated gates complete; Firefox check pending)
9. Deployment, demo, and mentor handoff (next after Phase 8 closes)

## License

This project is available under the [MIT License](LICENSE).

