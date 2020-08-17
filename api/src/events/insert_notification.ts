import { Request, Response } from 'express'
import { notificationQueue } from 'jobs'

const handler = async (req: Request, res: Response) => {
  const { id } = req.body.event.data.new
  notificationQueue.add({ id })

  return res.json()
}

export default handler
