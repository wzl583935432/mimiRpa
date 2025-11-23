import { z } from 'zod'

export const projectIpcSchema = {
  'project_query_list': {
    args: z.tuple([]),
    return: z.array(z.any()),
  },
  'project_create_new': {
    args: z.tuple([z.any()]), 
    return: z.any(),
  },
}
