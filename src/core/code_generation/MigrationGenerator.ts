export class MigrationGenerator {
  public generateMigration(tableName: string, columns: string[]): string {
    return `-- CreateTable\nCREATE TABLE "${tableName}" (\n${columns.map(c => `  "${c.split(' ')[0]}" TEXT NOT NULL`).join(',\n')},\n  CONSTRAINT "${tableName}_pkey" PRIMARY KEY ("id")\n);\n`;
  }
}
