import { promises as fs } from 'fs'; // 使用 promise 版本的 fs
import path from 'path';
import { dirname } from 'path';
import log from 'electron-log'
import { fa } from 'zod/v4/locales';

export class FileService{

    private static instance: FileService;

    private constructor() {
    }
        // 静态公共方法，用于获取唯一的实例
    public static getInstance(): FileService {
    // 检查实例是否已经存在，如果不存在则创建
        if (!FileService.instance) {
            FileService.instance = new FileService();
        }
        return FileService.instance;
    }

    public async readFile(fileName):Promise<string|null> {

        try {
            const data = await fs.readFile(fileName, 'utf-8');
            return data;
        } catch {
            return null;
        }
    }

    public async writeFile(fileName, content):Promise<boolean>{
        try {
            // 1. 获取目录路径
            const dir = dirname(fileName);

            // 2. 递归创建目录 (如果不存在)
            // recursive: true 确保多级目录如 ./a/b/c 都能创建
            await fs.mkdir(dir, { recursive: true });

            // 3. 写入文件
            // 默认 flag 是 'w' (write)，即：不存在创建，存在则覆盖
            await fs.writeFile(fileName, content, 'utf8');
            
            return true;
        } catch (error) {
            log.error(`写入文件${fileName}失败:`, error);
            return false;
        }

    }

}