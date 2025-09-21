import { z } from 'zod'

export const projectIpcSchema = {
  'project_query_list': {
    args: z.tuple([]),
    return: z.array(z.any()),
  },
}
