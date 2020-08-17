import { IncomingMessage } from 'http'
import { parseToken } from 'lib/sessionToken'
import { SessionToken } from 'types/sessionToken'

export interface Context {
  isAdmin: boolean
  isApp?: boolean
  authToken?: string
  authSession?: SessionToken.Payload
}

export async function createContext(ctx: {
  req: IncomingMessage
}): Promise<Context> {
  const authToken = ctx.req.headers.authorization?.replace('Bearer', '').trim()
  const isAdmin = ctx.req.headers['x-hasura-role'] === 'admin'

  if (!authToken) {
    return { isAdmin }
  }

  const authSession = await parseToken(authToken)

  return {
    isAdmin,
    isApp: authSession.role === 'user',
    authToken,
    authSession,
  }
}
