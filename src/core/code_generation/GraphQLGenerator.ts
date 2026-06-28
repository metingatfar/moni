export class GraphQLGenerator {
  public generateGraphQLSchema(typeName: string): string {
    return `type ${typeName} {\n  id: ID!\n  name: String!\n}\n\ntype Query {\n  get${typeName}(id: ID!): ${typeName}\n}\n`;
  }
}
