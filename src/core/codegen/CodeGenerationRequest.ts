import type { DevelopmentManifestData } from '../repository/DevelopmentManifest';

export interface CodeGenerationRequestData {
  requestId: string;
  userInput: string;
  developmentManifest: DevelopmentManifestData;
  targetFiles: string[];
  intent: string;
  constraints: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  requiresApproval: boolean;
}

export class CodeGenerationRequest {
  public createRequest(
    requestId: string,
    userInput: string,
    developmentManifest: DevelopmentManifestData
  ): CodeGenerationRequestData {
    return {
      requestId,
      userInput,
      developmentManifest,
      targetFiles: developmentManifest.affectedFiles.map(f => f.filePath),
      intent: developmentManifest.intent,
      constraints: ['VerbatimModuleSyntax', 'Read-Only Mode'],
      riskLevel: developmentManifest.riskLevel,
      requiresApproval: developmentManifest.approvalRequired
    };
  }
}

export const codeGenerationRequest = new CodeGenerationRequest();
export default codeGenerationRequest;
