import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { createContext } from 'lib/context'
import { schema } from 'lib/schema'
import registerActions from 'actions'
import registerEvents from './events'
import setupBull from 'jobs/index'
import bodyParser from 'body-parser'


setupBull()

const server = new ApolloServer({
  schema,
  context: createContext,
})

const app = express()
app.use(bodyParser.json());
server.applyMiddleware({ app });
registerActions(app)
registerEvents(app)

const PORT = process.env.PORT || 3000
app.listen({ port: PORT }, () => {
  console.log(`🚀  Server ready http://localhost:${PORT}${server.graphqlPath}`)
})
