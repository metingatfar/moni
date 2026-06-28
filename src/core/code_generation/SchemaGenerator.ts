export class SchemaGenerator {
  public generateSchema(tableName: string, columns: string[]): string {
    return `model ${tableName} {\n${columns.map(c => `  ${c.split(' ')[0]} String`).join('\n')}\n}\n`;
  }
}
