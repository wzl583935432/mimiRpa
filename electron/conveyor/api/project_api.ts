import { ConveyorApi } from "@/electron/preload/shared";

export class ProjectApi extends ConveyorApi {
      QueryProjectList = () => this.invoke('project_query_list')
}
