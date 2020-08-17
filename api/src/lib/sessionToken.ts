import jwt from 'jsonwebtoken'
import { DEFAULT_ROLE } from 'app/constants'
import { Model } from 'types/model'
import { SessionToken } from 'types/sessionToken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  console.error('Missing env JWT_SECRET')
  process.exit(1)
}

export const signJWT = (data: SessionToken.Payload): string =>
  jwt.sign(data, JWT_SECRET, { algorithm: 'HS512' })

export const parseToken = (token: string): Promise<SessionToken.Payload> =>
  new Promise((resolve, reject) =>
    jwt.verify(
      token,
      JWT_SECRET,
      { algorithms: ['HS512'] },
      (error, payload) => {
        if (error) {
          reject(error)
          return
        }

        resolve(payload as SessionToken.Payload)
      },
    ),
  )

export const createAppSessionToken = async (
  app: Model.App,
  role: string = DEFAULT_ROLE,
) => {
  return signJWT({
    userId: app.id.toString(),
    role,
    'https://hasura.io/jwt/claims': {
      'x-hasura-allowed-roles': [role],
      'x-hasura-default-role': role,
      'x-hasura-app-pk': app.id.toString(),
      'x-hasura-app-id': app.app_id
    },
  })
}

export const createUserSessionToken = async (
  app: Model.App,
  ref: string,
  recipientIds: string[]
) => {
  return signJWT({
    userId: app.id.toString(),
    role: 'externalUser',
    'https://hasura.io/jwt/claims': {
      'x-hasura-allowed-roles': ['externalUser'],
      'x-hasura-default-role': 'externalUser',
      'x-hasura-app-pk': app.id.toString(),
      'x-hasura-app-id': app.app_id,
      'x-hasura-external-user-id': ref,
      'x-hasura-recipient-ids': toPgArray(recipientIds)
    },
  })
}

function toPgArray(arr: string[]) {
  const m = arr.map(e=> `"${e}"`).join(",")
  return `{${m}}`
}
