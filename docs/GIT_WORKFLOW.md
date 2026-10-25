# Git and Kanban Workflow

## Branches

Keep the default branch deployable. Create short-lived branches from its latest state:

- `feature/<issue>-short-description`
- `fix/<issue>-short-description`
- `docs/<issue>-short-description`
- `chore/<issue>-short-description`

Examples: `feature/12-seat-holds`, `docs/3-setup-guide`.

## Commits

Write small, focused commits with an imperative subject. A simple conventional prefix is encouraged:

```text
feat: add movie search endpoint
fix: prevent expired hold confirmation
docs: describe local MongoDB setup
test: cover concurrent seat requests
```

Do not commit `.env` files, generated builds, package directories, database dumps, or credentials.

## Pull requests

1. Link the Kanban issue and state what user or technical outcome changed.
2. Keep unrelated refactors out of the change.
3. Include test commands/results and UI evidence where relevant.
4. Identify environment, schema, deployment, or backward-compatibility effects.
5. Resolve review feedback and rerun affected checks before merge.

## Suggested Kanban columns

```text
Backlog -> Ready -> In Progress -> Review -> Testing -> Done
```

- **Backlog:** understood at a high level but not prepared for implementation.
- **Ready:** acceptance criteria, dependencies, and design questions are resolved.
- **In Progress:** actively owned; limit work in progress.
- **Review:** pull request open and automated checks complete.
- **Testing:** review approved; final functional verification underway.
- **Done:** definition of done is satisfied and links/evidence are attached.

## Releases

Use semantic versions once a deployable application exists. Record notable changes in `CHANGELOG.md`, tag the reviewed commit, and ensure deployment and rollback instructions match that version.

