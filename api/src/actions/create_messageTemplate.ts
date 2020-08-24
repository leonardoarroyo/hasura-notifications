import fetch from 'node-fetch'
import { Headers, HeadersInit } from 'node-fetch'
import { Request, Response } from 'express'
import { isViaEmail, parseJson, isValidSender, invalidJson } from 'lib/validationUtils'
import * as R from 'ramda'
import {
  HASURA_URL
} from 'app/constants'

const invalidEmailSender = R.ifElse(
  isViaEmail,
  R.pipe(
    R.prop('data'),
    parseJson,
    R.prop('sender'),
    R.defaultTo(''),
    R.complement(isValidSender)
  ),
  R.always(false)
)

const HASURA_OPERATION = `
mutation InsertMessageTemplate(
  $via: notificationVia_enum,
  $version: bigint!,
  $value: String!,
  $locale: String!,
  $kind_id: bigint!,
  $data: jsonb!,
  $recipient_type: String!
) {
  insert_messageTemplate(objects: {
    via: $via,
    version: $version,
    value: $value,
    locale: $locale,
    kind_id: $kind_id,
    data: $data,
    recipient_type: $recipient_type
  }) {
    affected_rows
    returning {
      id
      locale
      updated_at
      value
      version
      via
      data
      created_at
      recipient_type
    }
  }
}
`;

// execute the parent mutation in Hasura
const execute = async (variables: object, { authorization }: { authorization: string }) => {
  const requestHeaders: HeadersInit = new Headers({ authorization });

  const fetchResponse = await fetch(
    HASURA_URL,
    {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        query: HASURA_OPERATION,
        variables,
      })
    }
  );
  return await fetchResponse.json();
};

const validateBody = R.cond([
  // Validate JSONs
  [R.compose(invalidJson, R.prop('data')), R.always('Can\'t parse JSON supplied to argument \'data\'.')],

  // Validate JSON data
  [invalidEmailSender, R.always('Your data.sender value is invalid. It should be a string in the format \'Name <user@domain.tld>\'')],

  // No errors
  [R.T, R.always(undefined)]
])

// Request Handler
const handler = async (req: Request, res: Response) => {
  const validationError = validateBody(req.body.input)

  if (validationError) {
    return res.status(400).json({
      code: 'ValidationError',
      message: validationError
    })
  }

  const { via, version, value, locale, kind_id, data: template_data, recipient_type } = req.body.input;
  const { authorization } = req.headers

  const { data, errors } = await execute({
    via,
    version,
    value,
    locale,
    kind_id,
    recipient_type,
    data: template_data
  }, { authorization: authorization! });

  if (errors) {
    return res.status(400).json({
      message: errors[0].message
    })
  }

  return res.json({
    affected_rows: data.insert_messageTemplate.affected_rows,
    ...data.insert_messageTemplate.returning[0],
  })
}

export default handler
