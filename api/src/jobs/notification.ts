import { Job } from 'bull'
import viaEmail from 'jobs/viaEmail'
import { NotificationError } from 'jobs/errors'
import { knex } from 'lib/database'
import * as R from 'ramda'

export interface NotificationData {
  id: number
  app_id: number
  recipient: string
  via: string
  data: string
  locale: string
  version: number
  template: string
  template_data: string
}

const getNotification = async (id: number): Promise<NotificationData> => await knex({ n: 'notification' })
    .select(
      // Notification
      'n.id', 'n.app_id', 'n.recipient', 'n.via', 'n.data',
      // Template
      'm.locale', 'm.version', 'm.value as template', 'm.data as template_data'
    )
    .leftJoin('messageTemplate AS m', {'m.id': 'n.message_template_id' })
    .where({ 'n.id': id })
    .limit(1)
    .first()

const storeNotificationResult = async (notification_id: number, data: object, status: string) =>
  knex.transaction(async transaction => {
    const [log] = await transaction
      .insert(
        {
          notification_id,
          data,
          status
        },
        ['id'],
      )
      .into('notificationLog')

    return { log }
  })

const catchErrors = async (fn: Function, job: Job) => {
  try {
    return await fn(job)
  } catch(e) {
    if (e.name === 'NotificationError') {
      await storeNotificationResult(job.data.id, {
        message: e.message
      }, 'FAILED')
    } else {
      await storeNotificationResult(job.data.id, {
        message: e.message,
        stack: e.stack
      }, 'INTERNAL_ERROR')
    }

    return Promise.reject(e)
  }
}

const getVia = R.prop('via')
const getViaProcessor = R.cond<string, Function>([
  [R.equals('email'), R.always(viaEmail)],
  [R.equals('app'), R.always(R.T)],
  [R.T, via => { throw new NotificationError(`Invalid notification via. Provided via was '${via}'.`) }]
])

export default async (job: Job) => catchErrors(
  async (job: Job) => {
    const notification = await getNotification(job.data.id)
    const via = getVia(notification)
    const processor = getViaProcessor(via)
    const result = await processor(notification)
    await storeNotificationResult(job.data.id, {}, 'SUCCESS')

    return result
  }, job)
