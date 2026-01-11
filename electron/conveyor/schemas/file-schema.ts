import { z } from 'zod'

export const fileIpcSchema = {
  'readFile': {
    args: z.tuple([z.string()]),
    return: z.any(),
  },
  'writeFile':{
    args: z.tuple([z.string(), z.string()]),
    return: z.boolean()
  }
}
