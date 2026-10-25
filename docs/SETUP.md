# Setup and Configuration

## Current implementation status

Both workspaces are runnable. The Express backend provides authentication, catalogue, inventory, and booking APIs. The React/Vite frontend provides responsive customer and role-protected admin workflows against those APIs.

## Prerequisites

### Software

- Windows 10/11, macOS, or a modern Linux distribution
- Node.js 22.13 or newer; the exact shared baseline is recorded in `.nvmrc`
- npm 8 or newer
- Docker Desktop (recommended local MongoDB path), MongoDB installed locally, or a managed MongoDB connection string
- Git and a code editor such as Visual Studio Code
- A current Chrome or Firefox release
- Optional: Postman or another REST client

### Recommended hardware

- Intel Core i5 / AMD Ryzen 5 class processor or better
- 8 GB RAM minimum; 16 GB recommended
- At least 1 GB free storage for source, packages, builds, and local database data
- Display resolution of 1366x768 or higher

## Local setup

Install dependencies after cloning:

```bash
git clone <repository-url>
cd imovies
npm install
```

Copy, but do not rename or commit over, the templates:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

On PowerShell, use:

```powershell
Copy-Item frontend/.env.example frontend/.env
Copy-Item backend/.env.example backend/.env
```

Start the Docker-managed MongoDB service and load safe development data:

```bash
npm run db:up
npm run seed
```

Then run the workspaces in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

Expected local addresses:

- Client: `http://localhost:5173`
- API: `http://localhost:5000/api/v1`
- Health endpoint: `http://localhost:5000/api/v1/health`

## Environment variables

### Client

| Name | Purpose | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Browser-visible API root | `http://localhost:5000/api/v1` |

Never put a secret in a `VITE_` variable; Vite exposes it to browser code.

### Server

| Name | Purpose |
| --- | --- |
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | HTTP listening port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Access-token signing secret |
| `JWT_ACCESS_EXPIRES_IN` | Access-token lifetime |
| `JWT_REFRESH_SECRET` | Separate refresh-token signing secret |
| `JWT_REFRESH_EXPIRES_IN` | Refresh-token lifetime |
| `CLIENT_URL` | Allowed browser origin |
| `BCRYPT_ROUNDS` | Password hashing cost |
| `SEED_CONFIRM` | Development-only safety confirmation for catalogue seeding |
| HOLD_CLEANUP_INTERVAL_MS | Interval for releasing expired booking holds; defaults to 60000 ms |
| SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD | Optional local admin demo account; keep values only in ignored .env |
| SEED_CUSTOMER_EMAIL / SEED_CUSTOMER_PASSWORD | Optional local customer demo account; keep values only in ignored .env |

Production secrets must come from the deployment platform's secret manager, not committed files.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run db:up` | Start local MongoDB with Docker Compose |
| `npm run db:down` | Stop local MongoDB without deleting its persistent volume |
| `npm run seed` | Load repeatable demo accounts, catalogue, shows, and seat inventories |
| `npm run dev:frontend` | Start the Vite development client |
| `npm run dev:backend` | Start the API with restart-on-change |
| `npm run build` | Build the production client |
| `npm test` | Run workspace test suites |
| `npm run lint` | Run workspace linters |
| `npm run verify` | Run lint, all tests, and the production frontend build |

## Troubleshooting checklist

- Confirm `node --version` and `npm --version` satisfy `package.json`.
- Confirm both `.env` files exist and contain no surrounding quotation mistakes.
- Confirm MongoDB is reachable from `MONGODB_URI`.
- Confirm ports 5000 and 5173 are free, or change configuration consistently.
- Confirm `CLIENT_URL` exactly matches the client origin if browser requests fail due to CORS.
- The frontend uses port 5173 with `strictPort`; stop an older Vite process if startup says that port is already in use.
- If admin pages redirect to Access denied, run `npm run seed`, then log in with the `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` values from the ignored `backend/.env` file.
- The repeatable development seed creates six published movies, six future shows, one cinema, one screen, and its seat inventories.
## Selected frontend tools

The supplied notes list several alternatives. IMovies uses React with Vite, React Router, Axios, and Bootstrap. Tailwind, Material UI, Ant Design, MDB, and Create React App are not mixed into this path, keeping one consistent responsive design system.

Optional Socket.io, a payment SDK, and email/SMS provider packages will be added only when their implementation phase starts and a provider has been selected. See [Mentor Requirements and Project Decisions](MENTOR_REQUIREMENTS.md).
