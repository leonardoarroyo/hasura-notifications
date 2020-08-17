import { objectType } from '@nexus/schema'

export const createdApp = objectType({
  name: 'CreatedApp',
  definition: t => {
    t.string('access_key')
    t.string('secret')
  },
})
