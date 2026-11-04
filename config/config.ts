import 'dotenv/config'

const postgresConfig = {
  username: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || null,
  host: process.env.PG_HOST || '127.0.0.1',
  port: Number(process.env.PG_PORT) || 5432,
  dialect: 'postgres' as const,
  logging: false,
}

const config = {
  development: {
    ...postgresConfig,
    database: process.env.PG_DATABASE || 'restaurant_drawer',
  },
  test: {
    ...postgresConfig,
    database: process.env.PG_DATABASE || 'database_test',
  },
  production: {
    ...postgresConfig,
    database: process.env.PG_DATABASE,
  }
}

export default config
