import { z } from 'zod'

export const editorIpcSchema = {
  'editor_node_tree_query': {
    args: z.tuple([]),
    return:  z.any(),
  },
    'editor_component_types_query': {
        args: z.tuple([]),
        return: z.record(z.string(), z.any()),
    }
}
