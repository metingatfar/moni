export class APIProjectGenerator {
  public planAPI(type: string): string[] {
    switch (type.toLowerCase()) {
      case 'rest':
        return ['routes/api.json', 'controllers/UserController.ts', 'middleware/auth.ts'];
      case 'graphql':
        return ['graphql/schema.graphql', 'graphql/resolvers.ts', 'graphql/context.ts'];
      case 'websocket':
        return ['websocket/gateway.ts', 'websocket/events.json', 'websocket/connection.ts'];
      case 'grpc':
        return ['protos/service.proto', 'services/grpc_server.go', 'services/grpc_client.go'];
      default:
        return ['routes/index.ts'];
    }
  }
}
export const apiProjectGenerator = new APIProjectGenerator();
export default apiProjectGenerator;
