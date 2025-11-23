// electron/db/editor_log_table_agemt.ts
// 这个类记录编辑器的操作日志，比如节点的添加、删除、修改等操作，方便后续的审计和回溯 回退 功能 日志最多保存1000条，超过后自动删除最早的日志
import type { Database as BetterSqlite3Database } from 'better-sqlite3'; 

export class EditorLogTableAgent{
    private db:BetterSqlite3Database | null = null;
    public constructor(db:BetterSqlite3Database) {
        this.db = db;
    }   
    
    public init(){
        if (!this.db) {
            throw new Error("Database not initialized.");
        }
        const createTableSQL = `
        CREATE TABLE IF NOT EXISTS editor_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            actionType TEXT NOT NULL,
            target TEXT NOT NULL,
            orginData TEXT,
            newData TEXT,
            createTime INTEGER NOT NULL,
            createUser TEXT NOT NULL
        );
        `;
        this.db.exec(createTableSQL);
    }
    
    public insertAndDeleteOldLogs(actionType:string, 
        target:string, 
        orginData:string, 
        newData:string, 
        createUser:string):boolean{
        if (!this.db) {
            throw new Error("Database not initialized.");
        }
        const currentTime = Date.now();
        const insertStmt = this.db.prepare(`
            INSERT INTO editor_log (actionType, target, orginData, newData, createTime, createUser)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        insertStmt.run(actionType, target, orginData, newData, currentTime, createUser);
        // 删除最早的日志，保持日志数量不超过1000条
        const deleteOldLogsStmt = this.db.prepare(`
            DELETE FROM editor_log
            WHERE id IN (
                SELECT id FROM editor_log
                ORDER BY id ASC
                LIMIT (SELECT COUNT(*) - 1000 FROM editor_log)
            )
        `);
        deleteOldLogsStmt.run();
        return true;
    }



    public getNewestLogs(limit: number): any[] {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }
        const selectStmt = this.db.prepare(`
            SELECT * FROM editor_log
            ORDER BY id DESC
            LIMIT ? 
        `);
        const rows = selectStmt.all(limit);

        return rows;
    }   

    public deleteLogById(id: number): boolean {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }
        const stmt = this.db.prepare('DELETE FROM editor_log WHERE id = ?');
        const info = stmt.run(id);
        return info.changes > 0;
    }


}