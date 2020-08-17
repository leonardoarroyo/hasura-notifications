export namespace SessionToken {
  export interface Claims {
    'x-hasura-allowed-roles': string[]
    'x-hasura-default-role': string
    'x-hasura-app-pk': string
    'x-hasura-app-id': string
    'x-hasura-external-user-id'?: string
    'x-hasura-recipient-ids'?: string
  }
  export interface Payload {
    userId: string
    role: string
    'https://hasura.io/jwt/claims': Claims
  }
}
