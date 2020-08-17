import { Request, Response } from 'express'
import { knex } from 'lib/database'
import { Context } from 'lib/context'
import { Model } from 'types/model'
import {
  MustBeAnAdministrator,
  MustBeAuthenticated
} from 'lib/graphqlErrors'
import { parseToken } from 'lib/sessionToken'
import { BCRYPT_ROUNDS } from 'app/constants'
import crypto from 'crypto'
import bcrypt from 'bcrypt'



export const verifyAppCredentials = async (
  access_key: string,
  secret: string
): Promise<[ boolean, Model.App | undefined ]> => {
  const app = await getAppByAccessKey(access_key)
  if (!app) {
    return [ false, undefined ]
  }

  const result = await bcrypt.compare(secret, app.secret)
  return [ result, app ]
}


/******************
 * Protect routes *
 ******************/
export const expressRequireAuth = async (
  req: Request,
  res: Response
): Promise<[boolean, any]> => {
  var out
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '').trim()
    out = await parseToken(token)
    return [true, out]
  } catch(e) {
    return [false, res.status(403).json({
      message: 'Authorization token is invalid'
    })]
  }
}

export const apolloRequireAdmin = ({ isAdmin }: Context) => {
  if (!isAdmin) {
    throw new MustBeAnAdministrator()
  }
}

export const apolloRequireAppAuth = (ctx: Context) => {
  if (!ctx.authSession || !ctx.isApp) {
    throw new MustBeAuthenticated()
  }
}

/*******
 * ORM *
 *******/
export const getAppByAccessKey = async (
  access_key: string,
): Promise<Model.App | undefined> => {
  return await knex('app')
    .where({
      access_key: access_key,
    })
    .first()
}

interface newApp {
  app: Model.App
  secret: string
}
export const createApp = async (
  name: string | null | undefined
): Promise<newApp> => {
  const access_key = crypto.randomBytes(20).toString('hex')
  const secret = crypto.randomBytes(64).toString('hex')
  const hashedSecret = await bcrypt.hash(secret, BCRYPT_ROUNDS)

  return knex.transaction(async transaction => {
    const [app] = await transaction
      .insert(
        {
          name,
          secret: hashedSecret,
          access_key
        },
        ['access_key', 'secret'],
      )
      .into('app')

    return { 
      app,
      secret
    }
  })
}
