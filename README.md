# Restaurant Drawer Backend

Backend API for Restaurant Drawer, a restaurant discovery and random-draw app. See the [frontend repository](https://github.com/sinon0049/restaurant_drawer_front) or try the [live website](https://restaurant-drawer-457aa.web.app/). This service uses Express and TypeScript, stores users and restaurant records in PostgreSQL, uses Redis for Express sessions, and queries Google Places for nearby restaurants.

## Features

- Email and password sign-up/sign-in
- Google and Facebook sign-in, account linking, and account unlinking
- JWT authentication in an HTTP-only cookie
- Session-backed CSRF token checks for state-changing requests
- Restaurant discovery and random selection using Google Places
- Per-user rate limiting for restaurant draws
- Persistent user and restaurant data with Sequelize migrations

## Requirements

- Node.js 24 (the Docker image is based on `node:24-alpine`)
- PostgreSQL
- Redis
- Google Maps Places API credentials with billing and the required Places API enabled
- OAuth credentials from Google and Facebook if those sign-in providers are used

## Local setup

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Create a PostgreSQL database and a Redis instance.

3. Create a `.env` file in the project root and provide the variables listed below. Do not commit this file or put production secrets in source control.

4. For local development, provide `localhost.pem` and `localhost-key.pem` in the project root. The development server starts over HTTPS and reads these certificate files directly.

5. Apply database migrations:

   ```bash
   npx sequelize-cli db:migrate
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

The local HTTPS server listens on port `3000` by default. `PORT` can override the port.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Set to `development`, `test`, or `production`. Development uses HTTPS certificates; other environments use `app.listen`. |
| `PORT` | HTTP/HTTPS listen port; defaults to `3000`. |
| `SECRET` | Secret used to sign and verify the one-hour JWT access token. |
| `SESSION_SECRET` | Secret used by `express-session`. |
| `REDIS_URL` | Redis connection URL used by `connect-redis`, for example `redis://localhost:6379`. |
| `PG_HOST` | PostgreSQL host; defaults to `127.0.0.1`. |
| `PG_PORT` | PostgreSQL port; defaults to `5432`. |
| `PG_USER` | PostgreSQL user; defaults to `postgres`. |
| `PG_PASSWORD` | PostgreSQL password. |
| `PG_DATABASE` | Database name. Defaults to `restaurant_drawer` in development and `database_test` in test; set it explicitly in production. |
| `GOOGLE_MAPS_APIKEY` | API key used by Google Places. |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret. |
| `FACEBOOK_CLIENT_ID` | Facebook OAuth app ID. |
| `FACEBOOK_CLIENT_SECRET` | Facebook OAuth app secret. |
| `BACKEND_URL` | Public backend origin used to construct OAuth callback URLs, such as `https://api.example.com`. |
| `FRONTEND_URL` | Frontend origin used for OAuth callback redirects, such as `https://example.web.app`. |

The backend's CORS allowlist is currently defined in `app.ts`. Add a frontend origin there when deploying the frontend to a different domain. Since the session cookie is configured with `Secure` and `SameSite=None`, the deployed service must be served over HTTPS.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run the TypeScript app with `tsx` and restart it with Nodemon. |
| `npm run build` | Compile TypeScript into `dist/`. |
| `npm start` | Run the compiled app at `dist/app.js`. |
| `npx sequelize-cli db:migrate` | Apply pending database migrations. |
| `npx sequelize-cli db:migrate:undo` | Undo the most recently applied migration. |

The `npm test` script is currently a placeholder and does not run an application test suite.

## API

All application routes are mounted under `/users` and `/restaurants`. Authenticated requests use the `accessToken` cookie. For browser clients, send requests with credentials enabled so the browser includes cookies.

### CSRF token

Fetch a CSRF token before making protected state-changing requests:

```http
GET /users/csrf_token
```

Send the returned token in the `X-CSRF-Token` header on routes marked **CSRF** below. The session cookie is named `csrf.sid`.

### User and authentication routes

| Method | Path | Auth / notes |
| --- | --- | --- |
| `POST` | `/users/signup` | CSRF; create an email/password account. |
| `POST` | `/users/signin` | CSRF; sign in with email/password. |
| `POST` | `/users/signout` | CSRF; clear the access-token cookie and rotate the session. |
| `GET` | `/users/current_user` | Auth; return the current user's profile. |
| `PUT` | `/users/profile` | Auth + CSRF; update the profile. |
| `PUT` | `/users/password` | Auth + CSRF; set or update the password. |
| `POST` | `/users/oauth/disconnect` | Auth + CSRF; unlink a social account. |
| `GET` | `/users/google/signin` | Start Google sign-in; callback: `/users/google/signin/callback`. |
| `GET` | `/users/facebook/signin` | Start Facebook sign-in; callback: `/users/facebook/signin/callback`. |
| `GET` | `/users/google/connect` | Authenticated account linking; callback: `/users/google/connect/callback`. |
| `GET` | `/users/facebook/connect` | Authenticated account linking; callback: `/users/facebook/connect/callback`. |

OAuth callback URLs registered with Google and Facebook must match the backend callback URLs generated from `BACKEND_URL`.

### Restaurant routes

| Method | Path | Auth / notes |
| --- | --- | --- |
| `GET` | `/restaurants` | Auth; list the signed-in user's saved restaurant records. |
| `POST` | `/restaurants/draw` | Auth + CSRF; search nearby Places and randomly select an open restaurant. Limited to 5 requests per user per minute. |
| `DELETE` | `/restaurants/:restaurantId` | Auth + CSRF; delete a saved restaurant record owned by the signed-in user. |

The draw request body contains a location and search radius, for example:

```json
{
  "location": { "lat": 25.033, "lng": 121.5654 },
  "radius": 1500
}
```

If no open restaurants are found, the endpoint returns `restaurant: null`. Google Places usage may incur charges; configure API restrictions and quotas in Google Cloud as well as the application's per-user rate limit.

## Database and migrations

Sequelize models are in `models/`; migrations are in `migrations/`. The Sequelize CLI configuration is pointed to `config/config.ts` by `.sequelizerc`. Migrations are not run automatically by the application at startup; apply them as a separate deployment step.

## Production deployment

The production service is split across these providers:

- **Render** runs the backend from the project Dockerfile.
- **Supabase** provides the PostgreSQL database.
- **Upstash** provides Redis for session storage.

In Render, configure the environment variables listed above with the production values: set `NODE_ENV=production`, use the Supabase PostgreSQL connection details for `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, and `PG_DATABASE`, and set `REDIS_URL` to the connection URL supplied by Upstash. Also configure the JWT/session secrets, Google and Facebook OAuth credentials, `GOOGLE_MAPS_APIKEY`, `BACKEND_URL`, and `FRONTEND_URL` if those features are enabled. Render provides `PORT` to the container.

Run Sequelize migrations against the production Supabase database as a separate deployment step before sending traffic to a version that depends on those schema changes. Keep all credentials in Render's environment settings; never add production values to this README or commit them in `.env`.

## Docker

Build and run the production image:

```bash
docker build -t restaurant-drawer-backend .
docker run --env-file .env -p 3000:3000 restaurant-drawer-backend
```

The image compiles TypeScript during its build stage and runs `node dist/app.js` in the production stage. Configure production environment variables through the hosting platform or a protected environment file. The Docker image does not include `.env`, local certificates, migrations, or development dependencies.
