
import * as fs from 'fs';
import { ProjectInfoDO, ProjectStatus, ProjectVersionStatus } from '@/lib/Model/Project/ProjectInfoDO'
import path from 'path'
import { UserService } from '../user_service';
import { v4 as uuidv4 } from 'uuid';
import { AppService } from '../app_service';
import { WorkflowBiz } from './workflow_biz';
import { WorkflowGraphEntity } from '@/electron/db/entity/workflow_graph_entity';
import { NodePropertyEntity } from '@/electron/db/entity/node_property_entity';


export class ProjectService{

    private workflowBizMap: Map<string, WorkflowBiz> = new Map();

    private static readonly DB_SUFFIX = '.db';

    private static instance: ProjectService;

    private constructor() {
    }

    // 静态公共方法，用于获取唯一的实例
    public static getInstance(): ProjectService {
    // 检查实例是否已经存在，如果不存在则创建
        if (!ProjectService.instance) {
            ProjectService.instance = new ProjectService();
        }
        return ProjectService.instance;
    }

    private readProjectsFromDisk():Array<ProjectInfoDO>{
        try {
            const projectInfoFile = AppService.getInstance().getProjectInfoFile();
            // 1. 同步读取文件内容（获取字符串）
            const fileContent = fs.readFileSync(projectInfoFile, { encoding: 'utf8' });

            // 2. 解析 JSON 字符串为 JS 对象
            const data = JSON.parse(fileContent);

            // 3. 类型断言：将解析后的对象断言为 ProjectInfoDO 数组
            // 注意：这里假设 JSON 结构与 ProjectInfoDO 接口完全匹配
            const projectList: Array<ProjectInfoDO> = data as Array<ProjectInfoDO>;
            
            return projectList;
        } catch (error) {
            console.error(`读取或解析文件失败: ${error}`);
            // 失败时返回空数组或抛出错误，视应用需求而定
            return [];
        }
    }

      private saveProjectsToDisk(projectInfoList: Array<ProjectInfoDO>):boolean{
        try {
            const projectInfoFile = AppService.getInstance().getProjectInfoFile();
            const pathDir = path.dirname( projectInfoFile);
            if(!fs.existsSync( pathDir)){
                fs.mkdirSync( pathDir, { recursive: true });
            }
            // 2. 解析 JSON 字符串为 JS 对象
            const fileContent = JSON.stringify(projectInfoList);
            console.log('saveProjectsToDisk', fileContent);
            console.log('projectInfoFile', projectInfoFile);
                       // 1. 同步读取文件内容（获取字符串）
            fs.writeFileSync(projectInfoFile, fileContent, { encoding: 'utf8' });
            return true
        } catch (error) {
            console.error(`读取或解析文件失败: ${error}`);
            // 失败时返回空数组或抛出错误，视应用需求而定
            return false
        }
    }

    private updateOrSaveProjectInfo(projectInfo:ProjectInfoDO){
        const projectInfoList: Array<ProjectInfoDO> = this.readProjectsFromDisk();
        const  findProjectInfo =  projectInfoList.find(item =>{
            return item.id === projectInfo.id;
        })
        if(findProjectInfo){
            findProjectInfo.description = projectInfo.description
            findProjectInfo.createUser = projectInfo.createUser
            findProjectInfo.createTime = projectInfo.createTime
            findProjectInfo.lastEditTime = projectInfo.lastEditTime
            findProjectInfo.name = projectInfo.name
            findProjectInfo.status = projectInfo.status
        }else{
            projectInfoList.push(projectInfo)
        }
        console.log('updateOrSaveProjectInfo-----', projectInfoList);
        this.saveProjectsToDisk(projectInfoList);
    }

    public async CreateProject(projectInfo:ProjectInfoDO):Promise<ProjectInfoDO>{
        console.log('CreateProject', projectInfo);
        const projectInfoList = this.readProjectsFromDisk();
        if(projectInfoList.find(item => item.name ===projectInfo.name)){
            throw new Error("项目名称已存在");
        }
    
        console.log('CreateProject after readProjectsFromDisk -----------------------------');
        const newProject: ProjectInfoDO = {
            id: uuidv4(),   
            name: projectInfo.name,
            status: ProjectStatus.Enabled,
            createTime:Date.now(),  
            createUser:UserService.getInstance().getCurrentUserId(),
            description:projectInfo.description,
            lastEditTime:Date.now(),
            versions: [
                {
                    version:"v1.0.0",
                    fromVersion: null,       
                    status:ProjectVersionStatus.Editor
                }
            ]
        };  
        this.updateOrSaveProjectInfo(newProject);
        return newProject;
    }



    // 获取目录下的一层子目录名，并按版本号排序
    getSortedSubdirectories(dirPath: string): string[] {
        // 读取目录内容
        const files = fs.readdirSync(dirPath);

        // 过滤出符合条件的子目录名 (以 .db 结尾的目录)
        const subDirs = files.filter(file => {
            const fullPath = path.join(dirPath, file);
            return fs.statSync(fullPath).isDirectory() && file.endsWith(ProjectService.DB_SUFFIX);
        });

        // 按版本号排序
        subDirs.sort((a, b) => {
            const versionA = a.replace(ProjectService.DB_SUFFIX, '');
            const versionB = b.replace(ProjectService.DB_SUFFIX, '');
            
            // 比较版本号
            return this.compareVersions(versionA, versionB);
        });

        return subDirs;
    }

    // 简单的版本号比较函数
    compareVersions(versionA: string, versionB: string): number {
        const versionArrayA = versionA.split('.').map(Number);
        const versionArrayB = versionB.split('.').map(Number);

        const length = Math.max(versionArrayA.length, versionArrayB.length);

        for (let i = 0; i < length; i++) {
            const segmentA = versionArrayA[i] || 0;
            const segmentB = versionArrayB[i] || 0;

            if (segmentA > segmentB) return 1;
            if (segmentA < segmentB) return -1;
        }

        return 0;
    }



    public  GetProjectVersions(projectId:string):Array<string>{
        const projectInfoList = this.readProjectsFromDisk();
        const projectInfo = projectInfoList.find(item => item.id === projectId)
     
        if(!projectInfo){
            throw new Error("项目不存在");
        }
        const versions = projectInfo.versions?.map(item => item.version) || [];
        return versions;
    }

        
     private incrementVersion(version: string): string {
        // 分割版本号为主版本、次版本和修订号
        const [major, minor, patch] = version.split('.').map(Number);

        // 对修订号进行加1
        let newPatch = patch + 1;
        let newMinor = minor;
        let newMajor = major;

        // 处理修订号进位
        if (newPatch >= 10) {
            newPatch = 0;
            newMinor += 1;

            // 处理次版本号进位
            if (newMinor >= 10) {
                newMinor = 0;
                newMajor += 1;
            }
        }

        // 重新组合为新的版本号
        return `v${newMajor.toString().padStart(2, '0')}.${newMinor.toString().padStart(2, '0')}.${newPatch.toString().padStart(2, '0')}`;
    }
    
    private getMaxVersion(versions: string[]): string {
        // 查找列表中最大版本号
        let maxVersion = versions[0];

        for (const version of versions) {
            if (this.compareVersions(version, maxVersion) > 0) {
                maxVersion = version;
            }
        }

        return maxVersion;
    }

    public async createProjectVersion(projectId:string, fromVersion:string):Promise<string>{
        const projectInfoList = this.readProjectsFromDisk();
        const projectInfo = projectInfoList.find(item => item.id === projectId)
        if(!projectInfo){
            throw new Error("项目不存在");
        }

        if(!projectInfo.versions){
            throw new Error("项目版本信息异常");
        }
        if(!projectInfo.versions.find(item => item.version === fromVersion) ){
            throw new Error(`不存在源版本${fromVersion}`);
        }
        const workflows_base_dir = AppService.getInstance().getBaseProjectWorkflowDir();
        const project_workflow_dir = path.join(workflows_base_dir, projectId);
        const from_version_dir = path.join( project_workflow_dir, `${fromVersion}${ProjectService.DB_SUFFIX}`);
        if(!fs.existsSync(from_version_dir)){   
            throw new Error(`源版本文件不存在:${from_version_dir}`);
        }
        const maxVersion = this.getMaxVersion(projectInfo.versions.map(item => item.version));
        const targetVersion = this.incrementVersion(maxVersion);

        const to_version_dir = path.join( project_workflow_dir, `${targetVersion}${ProjectService.DB_SUFFIX}`);
        fs.cpSync(from_version_dir, to_version_dir, { recursive: true });

        projectInfo.versions?.push({
            version:targetVersion,
            fromVersion:fromVersion,
            status:ProjectVersionStatus.Editor
        });
        projectInfo.lastEditTime = Date.now();
        this.updateOrSaveProjectInfo(projectInfo);  
        return targetVersion;
    }

    public async pubublishProject(projectId:string, version:string):Promise<boolean>{
        const projectInfoList = this.readProjectsFromDisk();
        const projectInfo = projectInfoList.find(item => item.id === projectId)
        if(!projectInfo){
            throw new Error("项目不存在");
        }
        if(!projectInfo.versions){
            throw new Error("项目版本信息异常");
        }
        const versionInfo = projectInfo.versions.find(item => item.version === version);
        if(!versionInfo){
            throw new Error("项目版本不存在");
        }
        versionInfo.status = ProjectVersionStatus.Published;
        projectInfo.lastEditTime = Date.now();
        this.updateOrSaveProjectInfo(projectInfo);
        return true;
    }

    public deleteProject(projectId:string):boolean{
        const projectInfoList = this.readProjectsFromDisk();
        const projectInfo = projectInfoList.find(item => item.id === projectId)
        if(!projectInfo){
            throw new Error("项目不存在");
        }
        projectInfo.status = ProjectStatus.Deleted;
        projectInfo.lastEditTime = Date.now();
        this.updateOrSaveProjectInfo(projectInfo);
        return true;
    }


    // 类的其他业务方法
    public getProjectList(): Array<ProjectInfoDO> {
        const projectList = this.readProjectsFromDisk();
        return projectList;
    }

    public getPageList(projectId:string, projectVersion:string):Record<string, string>
    {
        let workflowBiz = this.workflowBizMap.get(`${projectId}_${projectVersion}`);
        if (!workflowBiz) {
            workflowBiz = new WorkflowBiz(projectId, projectVersion);
            workflowBiz.init();
            this.workflowBizMap.set(`${projectId}_${projectVersion}`, workflowBiz);
        }
        return workflowBiz.getGraphList();
    }

    private getProjectVersionMainGraph(projectId:string, projectVersion:string):WorkflowGraphEntity{
        let workflowBiz = this.workflowBizMap.get(`${projectId}_${projectVersion}`);
        if (!workflowBiz) {
            workflowBiz = new WorkflowBiz(projectId, projectVersion);
            workflowBiz.init();
            this.workflowBizMap.set(`${projectId}_${projectVersion}`, workflowBiz);
        }
        const workflowGraphEntity = workflowBiz.getMainEditorGraph();
        return workflowGraphEntity;
    }

    public queryProjectMainGraphContent(projectId:string, projectVersion:string):string|null {
        const graphInfo = this.getProjectVersionMainGraph(projectId, projectVersion);
        if(graphInfo){
            return graphInfo.content;
        }
        return null;
    }


    public queryProjectGraphData(projectId:string, projectVersion:string, nodeId?:string):WorkflowGraphEntity|null{

        let workflowBiz = this.workflowBizMap.get(`${projectId}_${projectVersion}`);
        if (!workflowBiz) {
            workflowBiz = new WorkflowBiz(projectId, projectVersion);
            workflowBiz.init();
            this.workflowBizMap.set(`${projectId}_${projectVersion}`, workflowBiz);
        }
        const workflowGraphEntity = workflowBiz.getWorkflowGraphById(nodeId || "main");

        return workflowGraphEntity;
    }

    public saveProjectGraphData(projectId:string, projectVersion:string, graphId:string, data:string):boolean{   
        console.log('开始保存')
        let workflowBiz = this.workflowBizMap.get(`${projectId}_${projectVersion}`);
        if (!workflowBiz) {
            workflowBiz = new WorkflowBiz(projectId, projectVersion);
            workflowBiz.init();
            this.workflowBizMap.set(`${projectId}_${projectVersion}`, workflowBiz);
        }

        workflowBiz.saveContentById(graphId, data);
        return true;    
    }
    
    public saveNodeProperties(projectId:string, 
        projectVersion:string, 
        nodeId:string,
        properties:Record<string,string>):boolean{
        let workflowBiz = this.workflowBizMap.get(`${projectId}_${projectVersion}`);
        if (!workflowBiz) {
            workflowBiz = new WorkflowBiz(projectId, projectVersion);
            workflowBiz.init();
            this.workflowBizMap.set(`${projectId}_${projectVersion}`, workflowBiz);
        }
        workflowBiz.saveProperties(nodeId, properties);
        return true
    }
     public getNodeProperties(projectId:string, 
        projectVersion:string, 
        nodeId:string):Array<NodePropertyEntity>{
        let workflowBiz = this.workflowBizMap.get(`${projectId}_${projectVersion}`);
        if (!workflowBiz) {
            workflowBiz = new WorkflowBiz(projectId, projectVersion);
            workflowBiz.init();
            this.workflowBizMap.set(`${projectId}_${projectVersion}`, workflowBiz);
        }
        return workflowBiz.getPropertiesById(nodeId);
    }
        
}
