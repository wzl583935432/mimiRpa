import { z } from 'zod'

export const engineIpcSchema = {
  'runWorkflow': {
    args: z.tuple([z.string(), z.any()]),
    return: z.any(),
  }
}
