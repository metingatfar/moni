export interface CodingRequest {
  requestId: string;
  goal: string;
  targetLanguage: string;
  targetFramework: string;
  constraints: string[];
  acceptanceCriteria: string[];
}
