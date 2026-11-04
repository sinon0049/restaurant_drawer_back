# Restaurant Drawer(Backend)

This is the backend server for [my Restaurant Drawer web app](https://github.com/sinon0049/restaurant_drawer_front).

## Environments And Utilities

+ Node.js(Express)
+ Passport
+ PostgreSQL/Sequelize
+ google-auth-library

## PostgreSQL Configuration

The application and Sequelize CLI use the following environment variables:

- `PG_HOST` (defaults to `127.0.0.1`)
- `PG_PORT` (defaults to `5432`)
- `PG_USER` (defaults to `postgres`)
- `PG_PASSWORD`
- `PG_DATABASE` (defaults to `todo_rest` in development and `database_test` in test; set it explicitly in production)

The existing `DB_*` variables are not used by this PostgreSQL configuration.
