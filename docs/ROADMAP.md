# Delivery Roadmap

The project backlog is organized into six epics and 19 planned stories. Estimates are planning aids, not commitments. Each story should receive detailed acceptance criteria on the Kanban board before implementation.

## Epic 1: Project setup and configuration (3 stories)

1. Create repository hierarchy and workspace configuration.
2. Document requirements, architecture, setup, data, API, security, and quality strategy.
3. Initialize the remote repository, Kanban workflow, and review links.

Phase 1 covers the local structure and documentation portions of this epic. The GitHub/demo URLs remain placeholders until those external resources exist.

## Epic 2: Backend development (4 stories)

**Status:** Stories 4-17 are implemented and pass the automated integration, security, concurrency, and production-build gates. The current-Firefox manual journey remains before the integration phase closes.

4. Bootstrap the Express application, environment validation, middleware, health route, and error contract.
5. Implement registration, login, refresh/logout, profile access, and role authorization.
6. Implement public movie, cinema, and show discovery endpoints.
7. Implement admin catalogue, cinema, screen, and show management endpoints.

## Epic 3: Database development (3 stories)

8. Implement and index user, movie, cinema, screen, and show schemas.
9. Implement show-seat inventory and atomic hold/booking persistence.
10. Add deterministic development seeds and database integration tests.

## Epic 4: Frontend development (4 stories)

11. Create responsive navigation, layouts, routing, theme, and shared UI states.
12. Build authentication and customer profile flows.
13. Build movie discovery, details, cinema/date, and showtime flows.
14. Build seat selection, booking confirmation/history, and admin screens.

## Epic 5: Integration and quality (3 stories)

15. Connect client services to the versioned API and handle sessions/errors consistently.
16. Complete unit, integration, booking-concurrency, accessibility, and end-to-end coverage.
17. Perform performance, security, responsive, and cross-browser review; resolve release blockers.

## Epic 6: Project execution and release (2 stories)

18. Configure deployment environments, production build, database operations, monitoring, and rollback notes.
19. Publish the demo and GitHub links and complete the mentor-ready project walkthrough.

## Definition of done

A story is done when its acceptance criteria pass, relevant tests and linting pass, security/authorization impact is considered, documentation/configuration examples are updated, and the change has been reviewed and merged.

## Phase checkpoints

| Phase | Exit condition |
| --- | --- |
| 1 - Foundation | Structure and baseline documents are complete and internally consistent |
| 2 - Backend | Versioned API and authentication contracts work in integration tests |
| 3 - Data | Models, indexes, seeds, and conflict-safe booking behavior are verified |
| 4 - Frontend | Responsive customer/admin flows work against the API |
| 5 - Integration | Critical journeys and quality/security gates pass |
| 6 - Release | Deployed demo, repository link, monitoring, and handoff are ready |

## Supplied-feature scope lock

The existing 19 stories retain their numbering, with these requirements folded into their acceptance criteria:

- Catalogue stories include ratings/reviews and theater terminology mapping.
- Booking/data stories include payments, refunds, rescheduling, favorites, notifications, and optional real-time events after atomic seat locking.
- Customer frontend stories include watchlist, reviews, payment, ticket confirmation, and notification states.
- Admin stories include users, review moderation, payment/refund visibility, and revenue reports.
- Release stories include Atlas, CI/CD, HTTPS, monitoring/error tracking, and configured email/SMS/payment providers.

See [Mentor Requirements and Project Decisions](MENTOR_REQUIREMENTS.md) for traceability.
