import { SettingTableAgent } from "@/electron/db/setting_table_agent";
import {app } from "electron";
import path from "path";
import { UserService } from "./user_service";
import { SettingEntity } from "@/electron/db/entity/setting_entity";
import { v4 as uuidv4 } from 'uuid';
import fs from "fs";

export class SettingService {
    
    private dbAgent:SettingTableAgent | null = null;

    private isInit:boolean = false;

    private static instance: SettingService;
    private constructor() {
    }
        // 静态公共方法，用于获取唯一的实例
    public static getInstance(): SettingService {
    // 检查实例是否已经存在，如果不存在则创建
    if (!SettingService.instance) {
        SettingService.instance = new SettingService();
    }
        return SettingService.instance;
    }

    public init(){
        if(this.isInit){
            return;
        }
        const appPath = app.getAppPath();
        const settingDBPath = path.join(appPath, 
            "data",
            UserService.getInstance().getCurrentUserId(),
            "setting.db");
        const pathDir = path.dirname( settingDBPath);
        if(!fs.existsSync( pathDir)){
            fs.mkdirSync( pathDir,
                { recursive: true });
        }
        this.dbAgent = new SettingTableAgent(settingDBPath);
        //  初始化应用相关服务
        this.dbAgent.init();
        // 初始化应用相关服务
        
        this.isInit = true;
    }

    public getSettingValue(key:string, default_value:string):string{
        if(!this.dbAgent){
            return default_value;
        }
        const setting = this.dbAgent.getSettingByKey(key);
        if(setting){
            return setting.value;
        }   
        return default_value;
    }

    public setSettingValue(key:string, value:string):void{
        if(!this.dbAgent){
            return;
        }
        const id = uuidv4();
        const currentTime = Date.now();
        const createUser = UserService.getInstance().getCurrentUserId();
        const setting = new SettingEntity(id, key, value, currentTime, createUser, currentTime);
        this.dbAgent.updateOrInsertSetting(setting);
    }   

}   