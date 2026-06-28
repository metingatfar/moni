import type { MeetingPackage } from './MeetingRecorder';

export class MeetingArchive {
  private meetings: MeetingPackage[] = [];

  constructor() {
    this.seedMockMeetings();
  }

  private seedMockMeetings(): void {
    this.meetings.push({
      meetingId: 'meet-101',
      timestamp: Date.now() - 172800000,
      participatingAgents: ['LeadArchitectAgent', 'BackendDeveloperAgent', 'SecurityEngineerAgent'],
      questions: ['Enforce database indexing or table-level permissions first?'],
      discussionTranscript: [
        '[LeadArchitectAgent]: We need robust security audit tables.',
        '[BackendDeveloperAgent]: Database constraints will resolve core mapping limits.',
        '[SecurityEngineerAgent]: Strict role enforcement is mandatory.'
      ],
      proposedSolutions: ['Implement schema migration script with default admin index'],
      acceptedDecisions: ['FastAPI server routes secured using OAuth2 and scope levels'],
      rejectedAlternatives: ['Custom raw cookie authentication'],
      consensusResult: {
        verdict: 'Accepted',
        consensusScore: 92,
        reasoning: 'Unanimous decision to secure API paths using OAuth2 scopes.'
      },
      actionItems: ['Define scopes in roles config file'],
      assignedAgents: ['SecurityEngineerAgent'],
      followUpTasks: ['Task: Define scopes in roles config file (Assigned: SecurityEngineerAgent)'],
      approvalStatus: 'Approved'
    });

    this.meetings.push({
      meetingId: 'meet-102',
      timestamp: Date.now() - 86400000,
      participatingAgents: ['LeadArchitectAgent', 'FrontendDeveloperAgent', 'UXReviewerAgent'],
      questions: ['How to decouple presentation logic from the state container?'],
      discussionTranscript: [
        '[LeadArchitectAgent]: Decoupling ensures pure presentation renders.',
        '[FrontendDeveloperAgent]: Let\'s bind UI states to local themes.',
        '[UXReviewerAgent]: Micro-animations must match layout bounds.'
      ],
      proposedSolutions: ['Use service controller bindings in MoniDashboard'],
      acceptedDecisions: ['Decoupled presentation view with isolated hook hooks'],
      rejectedAlternatives: ['Direct state mutation inside main view render blocks'],
      consensusResult: {
        verdict: 'Accepted',
        consensusScore: 88,
        reasoning: 'Decoupled presentation maintains clean styling rules.'
      },
      actionItems: ['Refactor style injection in dashboard'],
      assignedAgents: ['FrontendDeveloperAgent'],
      followUpTasks: ['Task: Refactor style injection in dashboard (Assigned: FrontendDeveloperAgent)'],
      approvalStatus: 'Approved'
    });
  }

  public saveMeeting(meeting: MeetingPackage): void {
    const existingIdx = this.meetings.findIndex(m => m.meetingId === meeting.meetingId);
    if (existingIdx >= 0) {
      this.meetings[existingIdx] = meeting;
    } else {
      this.meetings.push(meeting);
    }
  }

  public getAllMeetings(): MeetingPackage[] {
    return this.meetings;
  }

  public getMeetingById(meetingId: string): MeetingPackage | undefined {
    return this.meetings.find(m => m.meetingId === meetingId);
  }

  public searchMeetings(query: string): MeetingPackage[] {
    const lowerQuery = query.toLowerCase();
    return this.meetings.filter(m => 
      m.meetingId.toLowerCase().includes(lowerQuery) ||
      m.participatingAgents.some(a => a.toLowerCase().includes(lowerQuery)) ||
      m.questions.some(q => q.toLowerCase().includes(lowerQuery)) ||
      m.acceptedDecisions.some(d => d.toLowerCase().includes(lowerQuery)) ||
      m.discussionTranscript.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }
}
