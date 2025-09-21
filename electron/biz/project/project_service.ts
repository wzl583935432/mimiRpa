

import { ProjectInfoDO, ProjectStatus, ProjectVersionStatus } from '@/lib/Model/Project/ProjectInfoDO'

export class ProjectService{
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

    // 类的其他业务方法
    public getProjectList(): Array<ProjectInfoDO> {
        const projectList: Array<ProjectInfoDO> = new Array<ProjectInfoDO>();
        const newProject: ProjectInfoDO = {
        id: '1a2b3c',
        name: '我的第一个项目',
        status: ProjectStatus.Enabled,
        createTime:Date.now(),
        createUser:"wzl",
        description:"mimi rpa  first test project",
        lastEditTime:Date.now(),
        versions: [
            {
                version:"xxx",
                status:ProjectVersionStatus.Editor
            }
        ]
        };
        // 使用 push() 方法将对象添加到数组中
        projectList.push(newProject);
        return new Array<ProjectInfoDO>()
    }
}
