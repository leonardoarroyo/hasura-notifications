import initKnex from 'knex'

export const knex = initKnex({
  client: 'pg',
  connection: process.env.PG_CONNECTION_URL,
})
