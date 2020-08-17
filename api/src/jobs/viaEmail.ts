import AWS from 'aws-sdk'
import * as R from 'ramda'
import { knex } from '../lib/database'
import { decrypt } from '../lib/crypt'
import { NotificationData } from 'jobs/notification'
import Handlebars from 'handlebars'
import { NotificationError } from 'jobs/errors'
import inlineCss from 'inline-css'

export type Credential = {
  access_key: string,
  secret_key: string,
  region: string,
}

export type Context = {
  meta: {
    sender: string,
    recipient: string,
    subject: string
  },
  html: string,
  txt: string
}

export type ParsedData = Omit<NotificationData, 'data'|'template_data'> & {
  data: object,
  template_data: {
    sender: string,
    subject: string,
  }
}

export type Email = {
  client: AWS.SES,
  params: AWS.SES.SendEmailRequest
}

export const parseData = (n: NotificationData): ParsedData => ({
  ...n,
  ...R.map((x: string) => JSON.parse(x || '{}'), { data: n.data, template_data: n.template_data })
})

export const renderTemplate = (template: string, data: object) => Handlebars.compile(template)(data)

export const renderCss = (html: string): Promise<string> => inlineCss(html, { url: "/" })

export const buildContext = async (n: ParsedData): Promise<Context> => ({
  meta: {
    sender: n.template_data.sender,
    recipient: n.recipient,
    subject: Handlebars.compile(n.template_data.subject || '(Sem assunto)')(n.data),
  },
  html: await renderCss(renderTemplate(n.template, n.data)),
  txt: renderTemplate(n.template, n.data)
})

export const buildSesParams = ({ meta: { recipient, sender, subject }, html, txt }: Context) => ({
  Destination: {
    ToAddresses: [ recipient ]
  },
  Source: sender,
  ReplyToAddresses: [
    sender
  ],
  Message: {
    Body: {
      Html: {
        Charset: "UTF-8",
        Data: html
      },
      Text: {
        Charset: "UTF-8",
        Data: txt
      }
    },
    Subject: {
      Charset: 'UTF-8',
        Data: subject
    }
  },
})

export const validateCredentials = R.when(
  R.complement(
    R.where({
      access_key: R.length,
      secret_key: R.length,
      region: R.length
    })
  ),
  () => { throw new NotificationError('AWS credentials incorrectly set up') }
)

export const credentialExists = R.when(
  R.isNil,
  () => { throw new NotificationError('AWS credentials do not exist for current app') }
)

export const decodeCredentials = ({ access_key, secret_key, region }: Credential): Credential => ({
  access_key: decrypt(access_key),
  secret_key: decrypt(secret_key),
  region: decrypt(region)
})

export const buildClient = ({ access_key, secret_key, region }: Credential) => new AWS.SES({ accessKeyId: access_key, secretAccessKey: secret_key, region })

export const getCredentials = async (app_id: number): Promise<Credential> => await knex
  .select('access_key', 'secret_key', 'region')
  .from('awsCredential')
  .where({ app_id })
  .limit(1)
  .first()

export const getClient = async (notification: NotificationData) => R.pipe(
    credentialExists,
    validateCredentials,
    decodeCredentials,
    buildClient
  )( (await getCredentials(notification.app_id)) )

const pipeWithPromise = R.pipeWith((f, previousResult) => (previousResult && previousResult.then) ? previousResult.then(f) : f(previousResult));

export const getParams = async (notification: NotificationData) => pipeWithPromise([
    parseData,
    buildContext,
    buildSesParams
  ])( notification )

export const buildEmail = async (notification: NotificationData): Promise<Email> => ({
  client: (await getClient(notification)),
  params: (await getParams(notification)) as AWS.SES.SendEmailRequest
})

export const sendEmail = ({ client, params }: Email) => client.sendEmail(params).promise()

export const success = (response: AWS.SES.SendEmailResponse) => Promise.resolve({
  status: "SUCCESS",
  serviceResponse: response
})

export default (notification: NotificationData) => R.pipeP(
  buildEmail,
  sendEmail,
  success
)( notification )
