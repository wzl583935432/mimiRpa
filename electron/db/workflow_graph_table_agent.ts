
import type { Database as BetterSqlite3Database } from 'better-sqlite3'; 
import { WorkflowGraphEntity } from './entity/workflow_graph_entity';

export class WorkflowGraphTableAgent{
    private db:BetterSqlite3Database | null = null;
    public constructor(db:BetterSqlite3Database) {
        this.db = db;
    }

    public init(){
        if (!this.db) {
            throw new Error("Database not initialized.");
        }   
        const createTableSQL = `
        CREATE TABLE IF NOT EXISTS workflow_graph (
            id TEXT PRIMARY KEY,    
            name TEXT NOT NULL,
            description TEXT,
            content TEXT,
            createTime INTEGER NOT NULL,
            createUser TEXT NOT NULL,
            lastEditTime INTEGER NOT NULL
        );
        `;
        this.db?.exec(createTableSQL);
    }

    getWorkflowGraphById(nodeId: string): WorkflowGraphEntity | null {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }   
        const stmt = this.db.prepare('SELECT * FROM workflow_graph WHERE id = ?');
        const row = stmt.get(nodeId);
        if (row) {
            return this.mapToWorkflowGraphEntity(row);
        }
        return null;
    }

    getAllWorkflowGraph(): WorkflowGraphEntity[] {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }
        const stmt = this.db.prepare('SELECT * FROM workflow_graph');
        const rows = stmt.all();
        return rows.map(row => this.mapToWorkflowGraphEntity(row));
    }

    getWorkflowGraphNames(): Record<string,string> {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }   
        const stmt = this.db.prepare('SELECT * FROM workflow_graph');
        const rows:any[]= stmt.all()
        const result = {}
        if(!rows){
            return result;
        }
        for (let index = 0; index < rows.length; index++) {
            const element = rows[index];
            result [element.id] = element.name;
        }
        return result;
    }

    mapToWorkflowGraphEntity(row: any): WorkflowGraphEntity {
        return new WorkflowGraphEntity(
            row.id,
            row.name,
            row.description,
            row.content,
            row.createTime,
            row.createUser,
            row.lastEditTime
        );
    }

    deleteWorkflowGraphById(nodeId: string): boolean {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }
        const stmt = this.db.prepare('DELETE FROM workflow_graph WHERE id = ?');
        const info = stmt.run(nodeId);
        return info.changes > 0;
    }

    saveContentById(id: string, content: string): boolean {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }
        const timestamp_ms = Date.now();
        const stmt = this.db.prepare(`
        UPDATE workflow_graph SET
            content = ?,
            lastEditTime = ?
        WHERE id = ?
        `);
        const info = stmt.run(
            content,
            timestamp_ms,
            id
        );
        return info.changes > 0;
    }


    saveOrUpdateWorkflowGraph(entity: WorkflowGraphEntity): boolean {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }
        console.log("saveOrUpdateWorkflowGraph")
        const existingEntity = this.getWorkflowGraphById(entity.id);
        if (existingEntity) {
            const stmt = this.db.prepare(`
            UPDATE workflow_graph SET
                name = ?,
                description = ?,
                content = ?,
                lastEditTime = ?
            WHERE id = ?
            `);
            const info = stmt.run(
                entity.name,
                entity.description,
                entity.content,
                entity.lastEditTime,
                entity.id
            );
            return info.changes > 0;
        }

        const stmt = this.db.prepare(`
        INSERT INTO workflow_graph (id, name, description, content, createTime, createUser, lastEditTime)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(
            entity.id,
            entity.name,
            entity.description,
            entity.content,
            entity.createTime,
            entity.createUser,
            entity.lastEditTime
        );
        return info.changes > 0;

    }



}