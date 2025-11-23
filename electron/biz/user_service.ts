
export class UserService {
    
    private static instance: UserService;

    private constructor() {
    }
        // 静态公共方法，用于获取唯一的实例
    public static getInstance(): UserService {
    // 检查实例是否已经存在，如果不存在则创建
    if (!UserService.instance) {
        UserService.instance = new UserService();
    }
        return UserService.instance;
    }

    public getCurrentUserId():string{   
        return "default_user";
    }

}   