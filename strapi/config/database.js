const path = require('path')
const parse = require('pg-connection-string').parse

module.exports = ({ env }) => {
  // Strapi Cloud provides DATABASE_URL automatically
  const databaseUrl = env('DATABASE_URL')

  if (databaseUrl) {
    const config = parse(databaseUrl)
    return {
      connection: {
        client: 'postgres',
        connection: {
          host: config.host,
          port: Number(config.port),
          database: config.database,
          user: config.user,
          password: config.password,
          ssl: { rejectUnauthorized: false },
        },
        debug: false,
      },
    }
  }

  const client = env('DATABASE_CLIENT', 'sqlite')

  if (client === 'postgres') {
    return {
      connection: {
        client: 'postgres',
        connection: {
          host: env('DATABASE_HOST', 'localhost'),
          port: env.int('DATABASE_PORT', 5432),
          database: env('DATABASE_NAME', 'strapi'),
          user: env('DATABASE_USERNAME', 'strapi'),
          password: env('DATABASE_PASSWORD', 'strapi'),
          ssl: env.bool('DATABASE_SSL', true) && { rejectUnauthorized: false },
        },
        pool: { min: 0, max: env.int('DATABASE_POOL_MAX', 10) },
        debug: false,
      },
    }
  }

  return {
    connection: {
      client: 'sqlite',
      connection: {
        filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  }
}
