
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
            nodeId TEXT,
            parentGraphId TEXT,
            createTime INTEGER NOT NULL,
            createUser TEXT NOT NULL,
            lastEditTime INTEGER NOT NULL
        );
        `;
        this.db?.exec(createTableSQL);
        const createIndexSql = `
                CREATE INDEX IF NOT EXISTS idx_workflow_graph_nodeId 
                ON workflow_graph (nodeId);
            `;

        this.db?.exec(createIndexSql);
    }

    getWorkflowGraphByNodeId(nodeId: string): WorkflowGraphEntity | null {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }   
        const stmt = this.db.prepare('SELECT * FROM workflow_graph WHERE nodeId = ?');
        const row = stmt.get(nodeId);
        if (row) {
            return this.mapToWorkflowGraphEntity(row);
        }
        return null;
    }

    mapToWorkflowGraphEntity(row: any): WorkflowGraphEntity {
        return new WorkflowGraphEntity(
            row.id,
            row.name,
            row.description,
            row.content,
            row.nodeId,
            row.parentGraphId,
            row.createTime,
            row.createUser,
            row.lastEditTime
        );
    }

    deleteWorkflowGraphByNodeId(nodeId: string): boolean {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }
        const stmt = this.db.prepare('DELETE FROM workflow_graph WHERE nodeId = ?');
        const info = stmt.run(nodeId);
        return info.changes > 0;
    }

    saveContentByNodeId(nodeId: string, content: string): boolean {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }
        const timestamp_ms = Date.now();
        const stmt = this.db.prepare(`
        UPDATE workflow_graph SET
            content = ?,
            lastEditTime = ?
        WHERE nodeId = ?
        `);
        const info = stmt.run(
            content,
            timestamp_ms,
            nodeId
        );
        return info.changes > 0;
    }


    saveOrUpdateWorkflowGraph(entity: WorkflowGraphEntity): boolean {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }

        const existingEntity = this.getWorkflowGraphByNodeId(entity.nodeId);
        if (existingEntity) {
            const stmt = this.db.prepare(`
            UPDATE workflow_graph SET
                name = ?,
                description = ?,
                content = ?,
                parentGraphId = ?,
                lastEditTime = ?
            WHERE nodeId = ?
            `);
            const info = stmt.run(
                entity.name,
                entity.description,
                entity.content,
                entity.parentGraphId,
                entity.lastEditTime,
                entity.nodeId
            );
            return info.changes > 0;
        }

        const stmt = this.db.prepare(`
        INSERT INTO workflow_graph (id, name, description, content, nodeId, parentGraphId, createTime, createUser, lastEditTime)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(
            entity.id,
            entity.name,
            entity.description,
            entity.content,
            entity.nodeId,
            entity.parentGraphId,
            entity.createTime,
            entity.createUser,
            entity.lastEditTime
        );
        return info.changes > 0;

    }



}