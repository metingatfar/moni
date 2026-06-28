export class SchemaVersionManager {
  private activeSchema = 'schema-v2';
  private legacySchemas = ['schema-v1'];

  public getActiveSchema(): string {
    return this.activeSchema;
  }

  public getCompatibilityMatrix(): string[] {
    return [this.activeSchema, ...this.legacySchemas];
  }

  public isCompatible(schema: string): boolean {
    return this.getCompatibilityMatrix().includes(schema);
  }
}
export const schemaVersionManager = new SchemaVersionManager();
export default schemaVersionManager;
