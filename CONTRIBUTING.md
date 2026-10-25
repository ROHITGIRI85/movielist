# Contributing to IMovies

## Before starting

1. Read the [requirements](docs/REQUIREMENTS.md) and [architecture](docs/ARCHITECTURE.md).
2. Create or assign a Kanban issue with clear acceptance criteria.
3. Branch from the latest default branch using the naming rules in [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md).

## Development expectations

- Keep secrets out of commits; update the relevant `.env.example` when adding configuration.
- Keep controllers thin and put reusable business rules in services.
- Validate all API input and enforce authorization on the server.
- Add or update tests with each behavior change.
- Keep documentation synchronized with API or architecture changes.

## Pull requests

Pull requests should be focused, linked to an issue, and include a summary, verification steps, screenshots for UI changes, and notes about configuration or database changes. A pull request is ready only when linting and relevant tests pass.

