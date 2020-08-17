import fetch from 'node-fetch'
import { Headers, HeadersInit } from 'node-fetch'
import { Request, Response } from 'express'
import { isViaEmail, parseJson, isValidSender, invalidJson, isInvalidEmail, isNotNil } from 'lib/validationUtils'
import * as R from 'ramda'

interface BaseBodyData {
  recipient: string,
  via: string,
  data: string,
  meta: string,
  message_template_id: number
}

/************************
 * Validation functions *
 ************************/
// If via is email, check if email is valid
const invalidEmailRecipient = R.ifElse(
  isViaEmail,
  R.pipe(
    R.prop('recipient'),
    isInvalidEmail
  ),
  R.always(false)
)

// If via is email, template_data should contain a valid sender string
const invalidEmailSender = R.ifElse(
  isViaEmail,
  R.pipe(
    R.prop('template_data'),
    parseJson,
    R.prop('sender'),
    R.complement(isValidSender)
  ),
  R.always(false)
)

const validateBody = R.cond([
  // Validate recipient
  [invalidEmailRecipient, R.always('Invalid \'recipient\' for via email.')],

  // Validate JSONs
  [R.compose(invalidJson, R.prop('data')), R.always('Can\'t parse JSON supplied to argument \'data\'.')],
  [R.compose(invalidJson, R.prop('meta')), R.always('Can\'t parse JSON supplied to argument \'meta\'.')],

  // Validate JSON data

  // No errors
  [R.T, R.always(undefined)]
])

const validateTemplate = R.cond([
  [R.pipe(R.length, R.equals(0)), R.always('Invalid message_template_id.')],
  [invalidEmailSender, R.always('Your template_data.sender value is invalid. It should be a string in the format \'Name <user@domain.tld>\'.')],
])

/************
 * GraphQL  *
 ************/
const GET_TEMPLATE = `
query GetMessageTemplate($id: bigint!) {
  messageTemplate(where: {id: {_eq: $id}}) {
    via,
    kind_id
  }
}
`;
const HASURA_OPERATION = `
mutation sendNotificationWithNewTemplate(
  $recipient: String!,
  $data: jsonb!,
  $meta: jsonb!,
  $kind_id: bigint!,
  $message_template_id: bigint!,
  $via: notificationVia_enum,
) {
  insert_notification(objects: {
    via: $via,
    data: $data,
    meta: $meta,
    recipient: $recipient,
    scheduled_to: "1970-01-01",
    kind_id: $kind_id,
    message_template_id: $message_template_id,
  }) {
    affected_rows
  }
}
`;

const execute = async (variables: object, operation: string, headers: HeadersInit) => {
  const requestHeaders: HeadersInit = new Headers(headers);

  const fetchResponse = await fetch(
    "http://graphql-engine:8080/v1/graphql",
    {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        query: operation,
        variables
      })
    }
  );
  return await fetchResponse.json();
};

const getTemplate = async (id: number, headers: HeadersInit) => {
  const { data } = await execute({ id }, GET_TEMPLATE, headers);
  return data.messageTemplate
}


/******************
 * Data functions *
 ******************/
const getData = (data: BaseBodyData) => ({
  recipient: data.recipient,
  data: data.data,
  meta: data.meta,
  message_template_id: data.message_template_id
})

/******************
 * Action Handler *
 ******************/
const handler = async (req: Request, res: Response) => {
  const { authorization } = req.headers
  const headers: HeadersInit = {
    ['authorization']: authorization!
  }

  const validationError = validateBody(req.body.input)
  const template = await getTemplate(req.body.input.message_template_id, headers)
  const templateValidationError = validateTemplate(template)
  const error = validationError || templateValidationError
  if (error) {
    return res.status(400).json({
      code: 'ValidationError',
      message: error
    })
  }

  const requestData = getData(req.body.input)
  const { data: responseData, errors } = await execute(
    {
      ...requestData,
      ...template[0],
    },
    HASURA_OPERATION,
    headers
  );

  if (errors) {
    return res.status(400).json({
      message: errors[0].message
    })
  }

  return res.json({
    ...responseData.insert_notification
  })
}

export default handler
