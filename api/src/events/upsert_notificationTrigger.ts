import { Request, Response } from 'express'
import { knex } from '../lib/database'

const handler = async (req: Request, res: Response) => {
  const { id, message_template_id } = req.body.event.data.new
  const message_template = await knex('messageTemplate')
    .where({
      id: message_template_id,
    })
    .first()
  await knex('notificationTrigger')
    .where({ id })
    .update({ kind_id: message_template.kind_id })
  console.log('updated')

  return res.json()
}

export default handler
