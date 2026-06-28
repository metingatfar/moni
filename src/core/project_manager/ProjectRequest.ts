export interface ProjectRequest {
  requestId: string;
  goal: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  complexity: 'low' | 'medium' | 'high';
  constraints: string[];
  userNotes?: string;
}
