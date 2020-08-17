import { Application, Request, Response, NextFunction } from 'express'
import { expressRequireAuth } from 'lib/auth'
import set_awsCredential from 'actions/set_awsCredential'
import send_notification from 'actions/send_notification'
import create_messageTemplate from 'actions/create_messageTemplate'
import trigger_notification from 'actions/trigger_notification'

export default (app: Application) => {
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.url.startsWith('/actions')) {
      const [ authResult, data ] = await expressRequireAuth(req, res)

      // Invalid authorization header
      if (!authResult) {
        return data
      }

      req.hasura = data['https://hasura.io/jwt/claims']
    }
    next()
  })
  app.post('/actions/set_awsCredential', set_awsCredential)
  app.post('/actions/send_notification', send_notification)
  app.post('/actions/create_messageTemplate', create_messageTemplate)
  app.post('/actions/trigger_notification', trigger_notification)
}
