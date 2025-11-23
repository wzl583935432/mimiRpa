import type { Database as BetterSqlite3Database } from 'better-sqlite3'; 
import { NodePropertyEntity } from './entity/node_property_entity';

export class NodePropertyTableAgent {
    private db:BetterSqlite3Database | null = null;
    public constructor(db:BetterSqlite3Database) {
        this.db = db;
    }
    public init(){
        if (!this.db) {
            throw new Error("Database not initialized.");
        }   
        const createTableSQL = `
        CREATE TABLE IF NOT EXISTS node_property (
            id TEXT PRIMARY KEY,
            nodeId TEXT NOT NULL,
            propertyName TEXT NOT NULL,
            propertyValue TEXT,
            createTime INTEGER NOT NULL,
            createUser TEXT NOT NULL,
            lastEditTime INTEGER NOT NULL,
            isDefault INTEGER NOT NULL
        );
        `;
        this.db?.exec(createTableSQL);

        const createIndexSql = `
            CREATE INDEX IF NOT EXISTS idx_node_property_nodeId 
            ON node_property (nodeId);
        `;

       this.db.exec(createIndexSql);
    }

    public getNodePropertiesByNodeId(nodeId: string): NodePropertyEntity[] {   
        if (!this.db) {
            throw new Error("Database not initialized.");
        }
        const stmt = this.db.prepare('SELECT * FROM node_property WHERE nodeId = ?');
        const rows = stmt.all(nodeId);
        return rows.map((row: any) => this.mapToNodePropertyEntity(row));
    }
    private mapToNodePropertyEntity(row: any): NodePropertyEntity {
        return new NodePropertyEntity(
            row.id,
            row.nodeId,
            row.propertyName,
            row.propertyValue,
            row.createTime,
            row.createUser,
            row.lastEditTime,
            row.isDefault === 1
        );
    }

    public deleteNodePropertiesByNodeId(nodeId: string): boolean {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }
        const stmt = this.db.prepare('DELETE FROM node_property WHERE nodeId = ?');
        const info = stmt.run(nodeId);
        return info.changes > 0;
    }


    public insertOrUpdateNodeProperty(nodeProperty: NodePropertyEntity): boolean {
        if (!this.db) {
            throw new Error("Database not initialized.");
        }
        const existingProperties = this.getNodePropertiesByNodeId(nodeProperty.nodeId)
        const existingProperty = existingProperties.find(prop => prop.propertyName === nodeProperty.propertyName);
        if (existingProperty) {
            const stmt = this.db.prepare(`
            UPDATE node_property SET
                propertyValue = ?,
                lastEditTime = ?,
                isDefault = ?
            WHERE id = ?
            `);
            const info = stmt.run(
                nodeProperty.propertyValue,
                nodeProperty.lastEditTime,
                nodeProperty.isDefault ? 1 : 0,
                existingProperty.id
            );
            return info.changes > 0;
        }
        else {
            const stmt = this.db.prepare(`
            INSERT INTO node_property (id, nodeId, propertyName, propertyValue, createTime, createUser, lastEditTime, isDefault)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const info = stmt.run(
                nodeProperty.id,
                nodeProperty.nodeId,
                nodeProperty.propertyName,
                nodeProperty.propertyValue,
                nodeProperty.createTime,
                nodeProperty.createUser,
                nodeProperty.lastEditTime,
                nodeProperty.isDefault ? 1 : 0
            );
            return info.changes > 0;
        }
    }

}