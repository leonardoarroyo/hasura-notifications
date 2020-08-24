import fetch from 'node-fetch'
import { Headers, HeadersInit } from 'node-fetch'
import { Request, Response } from 'express'
import { isInvalidEmail } from 'lib/validationUtils'
import * as R from 'ramda'
import {
  HASURA_URL
} from 'app/constants'

type recipientType = string | null

interface Recipient {
  via: string
  recipient: string
  type: recipientType
}

interface BaseBodyData {
  kind: string
  data: string
  meta: string
  recipients: [Recipient]
}

interface TriggerDispatchData {
  recipient: string
  message_template_id: number
  data: string
  meta: string
}

interface Trigger {
  message_template_id: number
  message_template: {
    via: string
  }
  recipient_type: string | null
}

type ViaAndRecipientType = [string, recipientType]

/**************
 * Validation *
 **************/
const getRecipientsForVia = (recipients: [Recipient]) => (
  v: ViaAndRecipientType,
) =>
  R.filter(
    (recipient) => recipient.via == v[0] && recipient.type == v[1],
    recipients,
  )

const invalidEmailRecipient = ({
  body,
  vias,
}: {
  body: BaseBodyData
  vias: [ViaAndRecipientType]
}) => {
  const viasEmail = R.filter(R.propEq(0, 'email'), vias)
  const recipients = R.map(getRecipientsForVia(body.recipients), viasEmail)
  const results = R.map((x) => isInvalidEmail(R.head(x)!.recipient), recipients)
  return results.includes(true)
}

const notAllRecipients = ({
  body,
  vias,
}: {
  body: BaseBodyData
  vias: [ViaAndRecipientType]
}) => {
  const recipientsForVia = getRecipientsForVia(body.recipients)
  const missingRecipients: boolean =
    R.pipe(
      R.map(recipientsForVia),
      R.filter((x) => x.length === 0),
      R.length,
    )(vias) > 0

  return missingRecipients
}

const mapNullToRepresentation = R.map<ViaAndRecipientType, ViaAndRecipientType>(
  ([a, b]) => [a, b || 'null'],
)

const mapViaToOutput = (x: [ViaAndRecipientType]) =>
  x.map((y) => y.join('-')).join(', ')

const notAllRecipientsError = ({ vias }: { vias: [ViaAndRecipientType] }) =>
  `The chosen kind_id has triggers for the following (via-type) pairs: ${mapViaToOutput(
    mapNullToRepresentation(vias) as [ViaAndRecipientType],
  )} . I can\'t find recipients for all pairs.`

const validate = R.cond([
  [notAllRecipients, notAllRecipientsError],
  [invalidEmailRecipient, R.always("Invalid 'recipient' for via email.")],
  [R.T, R.always(false)],
])

/************
 * GraphQL  *
 ************/
const GET_TRIGGER = `
query GetTriggers($kind_value: String!) {
  notificationTrigger(where: {kind: { value: { _eq: $kind_value }}}) {
    message_template_id,
    message_template {
      via
    },
    recipient_type
  }
}
`
const SEND_NOTIFICATION = `
mutation sendNotificationWithNewTemplate(
  $recipient: String!,
  $message_template_id: Int!,
  $data: SendNotificationJsonb!,
  $meta: SendNotificationJsonb!
) {
  send_notification(recipient: $recipient, message_template_id: $message_template_id, data: $data, meta: $meta) {
    affected_rows
  }
}
`

const execute = async (
  variables: object,
  operation: string,
  headers: HeadersInit,
) => {
  const requestHeaders: HeadersInit = new Headers(headers)

  const fetchResponse = await fetch(HASURA_URL, {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify({
      query: operation,
      variables,
    }),
  })
  return await fetchResponse.json()
}

const getTriggers = async (kind_value: string, headers: HeadersInit) => {
  const { data, errors } = await execute({ kind_value }, GET_TRIGGER, headers)

  return data.notificationTrigger
}

/******************
 * Data functions *
 ******************/
const getData = (data: BaseBodyData) => ({
  kind: data.kind,
  data: data.data,
  recipients: data.recipients,
})

const dispatchTrigger = (headers: HeadersInit) => (
  trigger: TriggerDispatchData,
) => {
  return execute(trigger, SEND_NOTIFICATION, headers)
}

const dispatchTriggers = (headers: HeadersInit) =>
  R.map(dispatchTrigger(headers))

const getViasAndTypes = (triggers: [Trigger]) =>
  R.map((t) => [t.message_template.via, t.recipient_type], triggers)

const getDispatchData = (triggers: [Trigger], body: BaseBodyData) => {
  return R.map((trigger: Trigger) => ({
    message_template_id: trigger.message_template_id,
    recipient: R.head(
      getRecipientsForVia(body.recipients)([
        trigger.message_template.via,
        trigger.recipient_type,
      ]),
    )!.recipient,
    data: body.data,
    meta: body.meta,
  }))(triggers)
}

/******************
 * Action Handler *
 ******************/
const handler = async (req: Request, res: Response) => {
  const { authorization } = req.headers
  const headers: HeadersInit = {
    ['authorization']: authorization!,
  }

  const requestData = getData(req.body.input)
  const triggers = await getTriggers(requestData.kind, headers)
  const vias = getViasAndTypes(triggers)
  const error = validate({ body: req.body.input, vias })
  if (error) {
    return res.status(400).json({
      code: 'ValidationError',
      message: error,
    })
  }

  const dispatchData = getDispatchData(triggers, req.body.input)
  const dispatched = dispatchTriggers(headers)(dispatchData)
  const results = await Promise.all(dispatched)
  const errors = R.filter(R.has('errors'), results)
  const errorMessages = R.map((x) => x.errors[0].message, errors)

  return res.json({
    triggered_count: results.length,
    errors: errorMessages,
  })
}

export default handler
