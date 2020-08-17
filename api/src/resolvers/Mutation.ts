import { mutationType, stringArg } from '@nexus/schema'
import { knex } from 'lib/database'
import {
  apolloRequireAdmin,
  apolloRequireAppAuth,
  verifyAppCredentials,
  createApp
} from 'lib/auth'
import {
  createAppSessionToken,
  createUserSessionToken
} from 'lib/sessionToken'
import {
  InvalidCredentials
} from 'lib/graphqlErrors'

export const Mutation = mutationType({
  definition: t => {
    t.field('createApp', {
      type: 'CreatedApp',
      args: {
        name: stringArg({ nullable: true }),
      },
      resolve: async (_, args, ctx) => {
        apolloRequireAdmin(ctx)
        const app = await createApp(args.name)

        return {
          access_key: app.app.access_key,
          secret: app.secret
        }
      }
    })

    t.field('createToken', {
      type: 'String',
      args: {
        access_key: stringArg({ nullable: false }),
        secret: stringArg({ nullable: false }),
      },
      resolve: async (_, args) => {
        const [ valid, app ] = await verifyAppCredentials(args.access_key, args.secret)

        if (!valid) {
          throw new InvalidCredentials
        }

        return createAppSessionToken(app!)
      },
    })

    t.field('createUserToken', {
      type: 'String',
      args: {
        ref: stringArg({ nullable: false }),
        recipient_ids: stringArg({ list: true, nullable: false }),
      },
      resolve: async (_, args, ctx) => {
        apolloRequireAppAuth(ctx)
        const app = await knex('app')
         .where({
           id: ctx.authSession?.["https://hasura.io/jwt/claims"]["x-hasura-app-pk"],
         })
         .first()

        return createUserSessionToken(app, args.ref, args.recipient_ids)
      },
    })
  },
})
