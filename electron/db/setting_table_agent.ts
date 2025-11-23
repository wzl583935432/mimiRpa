import  Database  from 'better-sqlite3';
import type { Database as BetterSqlite3Database } from 'better-sqlite3'; 
import { SettingEntity } from './entity/setting_entity';

export class SettingTableAgent{
    private dbFilePath:string;
    private db:BetterSqlite3Database | null = null;
    public constructor(dbFilePath:string) {
        this.dbFilePath = dbFilePath;
    }

    public init(){
        try {
        const createTableSQL = `
        CREATE TABLE IF NOT EXISTS setting (
            id TEXT PRIMARY KEY,    
            key TEXT NOT NULL,
            value TEXT,
            status INTEGER NOT NULL,
            createTime INTEGER NOT NULL,
            createUser TEXT NOT NULL,
            lastEditTime INTEGER NOT NULL
        );
        `;
        this.db = new Database(this.dbFilePath);
        this.db?.exec(createTableSQL);
        return true;
        } catch (error) {
            console.error("Failed to initialize database:", error);
            return false;
        }
    }

    public getSettingByKey(key: string): SettingEntity | null {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }
        const stmt = this.db.prepare('SELECT * FROM setting WHERE key = ?');
        const row = stmt.get(key);
        if (row) {
            return this.mapToSettingEntity(row);
        }
        return null;
    }
    public updateOrInsertSetting(setting: SettingEntity): boolean {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }   
        const existingSetting = this.getSettingByKey(setting.key);
        if (existingSetting) {
            const stmt = this.db.prepare(`
            UPDATE setting SET
                value = ?,
                lastEditTime = ?
            WHERE key = ?
            `);
            const info = stmt.run(
                setting.value,
                setting.lastEditTime,
                setting.key
            );
            return info.changes > 0;
        }
        else {
            const stmt = this.db.prepare(`
            INSERT INTO setting (id, key, value, createTime, createUser, lastEditTime)
            VALUES (?, ?, ?, ?, ?, ?)
            `);
            const info = stmt.run(
                setting.id,
                setting.key,
                setting.value,
                setting.createTime,
                setting.createUser,
                setting.lastEditTime
            );
            return info.changes > 0;
        }
    }


    private mapToSettingEntity(row: any): SettingEntity {
        return new SettingEntity(
            row.id,
            row.key,
            row.value,
            row.createTime,
            row.createUser,
            row.lastEditTime
        );
    }



}