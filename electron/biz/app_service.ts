import path from 'path'
import { UserService } from './user_service';
import { SettingService } from './setting_service';

export class AppService {
    
    private static instance: AppService;

    private constructor() {
    }
        // 静态公共方法，用于获取唯一的实例
    public static getInstance(): AppService {
    // 检查实例是否已经存在，如果不存在则创建
    if (!AppService.instance) {
        AppService.instance = new AppService();
    }
        return AppService.instance;
    }
    private basePath:string = '';

    public init(){
        // 初始化应用相关服务
        
    
    }

    public setBasePath(basePath:string){
        this.basePath = basePath;
    }


    public getProjectInfoFile(){
            const projectInfoFile = path.join(this.basePath, "data", UserService.getInstance().getCurrentUserId(), 'projectlist.json' )
            return projectInfoFile;
        }
    
    public getBaseProjectWorkflowDir():string {    
        let projectWorkflowDir:string = path.join(this.basePath, "project", UserService.getInstance().getCurrentUserId(), 'workflows' )
        projectWorkflowDir = SettingService.getInstance().getSettingValue("project_workflow_dir", projectWorkflowDir);
        return projectWorkflowDir;
    }


}   