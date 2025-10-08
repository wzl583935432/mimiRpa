import { ConveyorApi } from "@/electron/preload/shared";

export class EditorApi extends ConveyorApi {
      queryNodeTreeData = () => this.invoke('editor_node_tree_query')
      queryComponentTypes = () => this.invoke('editor_component_types_query')
}
