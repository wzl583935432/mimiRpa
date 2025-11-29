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
  'project_create_new_version': {
    args: z.tuple([z.string(), z.string()]), // projectId, projectVersion
    return: z.any(),
  },
  'project_query_version_list': {
    args: z.tuple([z.string()]), // projectId
    return: z.array(z.any()),
  },
  'project_query_version': {
    args: z.tuple([z.string(), z.string()]), // projectId, projectVersion
    return: z.any(),
  },
  'project_delete': {
    args: z.tuple([z.string()]), // projectId
    return: z.any(),
  },
  'project_delete_version': {
    args: z.tuple([z.string(), z.string()]), // projectId, projectVersion
    return: z.any(),
  },
  'project_query_graph_data': {
    args: z.tuple([z.string(), z.string(), z.string().optional()]), // projectId, projectVersion, nodeId
    return: z.any(),
  },
  'project_save_graph_data': {
    args: z.tuple([z.string(), z.string(), z.string(), z.string()]), // projectId, projectVersion, nodeId, data
    return: z.any(),
  },
}
