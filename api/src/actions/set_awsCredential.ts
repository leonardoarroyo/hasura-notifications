import fetch from 'node-fetch'
import R from 'ramda'
import { Headers, HeadersInit } from 'node-fetch'
import { encrypt } from 'lib/crypt'
import { Request, Response } from 'express'
import { HASURA_GRAPHQL_ADMIN_SECRET } from 'app/constants'

const HASURA_OPERATION = `
mutation set_awsCredential($access_key: String!, $secret_key: String!, $region: String, $app_id: bigint!) {
  insert_awsCredential(
    objects: [
      {
        access_key: $access_key,
        app_id: $app_id,
        secret_key: $secret_key
        region: $region,
      }
    ],
    on_conflict: {
      constraint: awsCredential_app_id_key,
      update_columns: [ access_key, secret_key, region ]
    }
  ) { 
    affected_rows
  }
}
`;

// execute the parent mutation in Hasura
interface QueryVariables {
  access_key: string
  secret_key: string
  region: string
  app_id: number
}
const execute = async (variables: QueryVariables) => {
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set('x-hasura-admin-secret', HASURA_GRAPHQL_ADMIN_SECRET)

  const fetchResponse = await fetch(
    "http://graphql-engine:8080/v1/graphql",
    {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        query: HASURA_OPERATION,
        variables
      })
    }
  );
  return await fetchResponse.json();
};
  

// Request Handler
const handler = async (req: Request, res: Response) => {
  const { access_key, secret_key, region } = req.body.input;
  const app_id = req.hasura['x-hasura-app-pk']
  const encrypted = R.map(encrypt, { access_key, secret_key, region })

  const { data, errors } = await execute({
    ...encrypted,
    app_id
  });

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json({
      message: errors[0].message
    })
  }

  // success
  return res.json({
    ...data.insert_awsCredential
  })

}

export default handler
