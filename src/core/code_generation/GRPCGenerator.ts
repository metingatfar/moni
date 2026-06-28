export class GRPCGenerator {
  public generateProtoDefinition(serviceName: string): string {
    return `syntax = "proto3";\n\nservice ${serviceName} {\n  rpc GetPayload (PayloadRequest) returns (PayloadResponse);\n}\n\nmessage PayloadRequest { string id = 1; }\nmessage PayloadResponse { string data = 1; }\n`;
  }
}
