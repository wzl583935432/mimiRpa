import { z } from 'zod'

export const UIIpcSchema = {
  "start_select_element": {
    args: z.tuple([]),
    return: z.any(),
  },
  "stop_select_element": {
    args: z.tuple([]),
    return: z.any(),
  },
}
