import { ConveyorApi } from "@/electron/preload/shared";

export class UIApi extends ConveyorApi {
      startSelectElement = () => this.invoke('start_select_element')
      stopSelectElement = () => this.invoke('stop_select_element')
}