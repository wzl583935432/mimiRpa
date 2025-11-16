
import { ElementTarget } from "@/lib/Model/Editor/ElementTarget";

export  class UiService{
    private static instance: UiService;
    private constructor() {

    }
    public static getInstance(): UiService {
        if (!UiService.instance) {
            UiService.instance = new UiService();
        }
        return UiService.instance;
    }


    public async startSelectElement() :Promise<ElementTarget|null>{
        const conveyor = window.conveyor;
        const ui_api = conveyor.ui
        
        const selectTarget = await ui_api.startSelectElement();
        console.log(selectTarget)
        return selectTarget;
    }

    public async stopSelectElement():Promise<void>{
        const conveyor = window.conveyor;
        const ui_api = conveyor.ui
        
        return await ui_api.stopSelectElement();
    }


}