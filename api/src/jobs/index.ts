import Queue from 'bull'
import notificationProcessor from './notification'

import { REDIS_URL } from 'app/constants'

export const notificationQueue = new Queue('notification', REDIS_URL)

export default () => {
  notificationQueue.process(notificationProcessor)
}
