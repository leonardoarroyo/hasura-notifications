import path from 'path'
import { makeSchema } from '@nexus/schema'
import * as resolvers from 'resolvers'
export const schema = makeSchema({
  types: resolvers,
  outputs: {
    schema: path.resolve('src', 'generated', 'schema.graphql'),
    typegen: path.resolve('src', 'generated', 'types.ts'),
  },

  typegenAutoConfig: {
    sources: [],
    contextType: 'ctx.Context',
  },
  formatTypegen: (content, filename) =>
    filename === 'types'
      ? `import * as ctx from 'lib/context';\n\n${content}`
      : content,
})
