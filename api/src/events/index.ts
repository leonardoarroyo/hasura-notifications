import { Application } from 'express'
import insert_notification from './insert_notification'
import upsert_notificationTrigger from './upsert_notificationTrigger'

export default (app: Application) => {
  app.post('/events/insert_notification', insert_notification)
  app.post('/events/upsert_notificationTrigger', upsert_notificationTrigger)
}
