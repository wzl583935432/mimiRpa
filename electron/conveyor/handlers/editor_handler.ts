import { EditorService } from "@/electron/biz/editor/editor_service"
import { handle } from '@/electron/main/shared'

export const registerEditorHandlers = () => {
  // App operations
  handle('editor_node_tree_query', () =>  EditorService.getInstance().queryNodeTreeData()) ;
  handle('editor_component_types_query', () => EditorService.getInstance().queryComponentTypes()) ; 
}
