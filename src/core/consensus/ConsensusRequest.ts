export interface ConsensusRequest {
  requestId: string;
  engineeringTask: string;
  providerList: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  contextHash: string;
}
