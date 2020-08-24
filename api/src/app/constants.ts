export const {
  APP_URL = 'http://localhost:3000',
  DEFAULT_ROLE = 'user',
  BCRYPT_ROUNDS = 10,
  HASURA_GRAPHQL_ADMIN_SECRET = '',
  HASURA_URL = 'http://graphql-engine:8080/v1/graphql',
  REDIS_URL = 'redis://127.0.0.1:6379'
} = process.env
