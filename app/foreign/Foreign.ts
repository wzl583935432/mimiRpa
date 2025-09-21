import { IProject } from "./IProject";
import {ProjectImp} from './imp/local/ProjectImp'

export class Foreign{
    private static instance: Foreign;

    private project:IProject|undefined;

    private constructor() {
    }

    // 静态公共方法，用于获取唯一的实例
    public static getInstance(): Foreign {
    // 检查实例是否已经存在，如果不存在则创建
    if (!Foreign.instance) {
        Foreign.instance = new Foreign();
    }
    return Foreign.instance;
    }

    public Project():IProject{
        if(!this.project){
            this.project = new ProjectImp()
        }
        return this.project;
    }


}

