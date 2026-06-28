import { container } from '../container/ServiceContainer';

export interface MeetingPackage {
  meetingId: string;
  timestamp: number;
  participatingAgents: string[];
  questions: string[];
  discussionTranscript: string[];
  proposedSolutions: string[];
  acceptedDecisions: string[];
  rejectedAlternatives: string[];
  consensusResult: {
    verdict: string;
    consensusScore: number;
    reasoning: string;
  };
  actionItems: string[];
  assignedAgents: string[];
  followUpTasks: string[];
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
}

export class MeetingRecorder {
  private currentMeeting: MeetingPackage | null = null;

  public startMeeting(meetingId: string, agents: string[]): void {
    this.currentMeeting = {
      meetingId,
      timestamp: Date.now(),
      participatingAgents: agents,
      questions: [],
      discussionTranscript: [],
      proposedSolutions: [],
      acceptedDecisions: [],
      rejectedAlternatives: [],
      consensusResult: {
        verdict: 'Requires Discussion',
        consensusScore: 0,
        reasoning: 'Meeting initiated.'
      },
      actionItems: [],
      assignedAgents: [],
      followUpTasks: [],
      approvalStatus: 'Pending'
    };
  }

  public recordQuestion(question: string): void {
    if (this.currentMeeting) {
      this.currentMeeting.questions.push(question);
    }
  }

  public recordTranscriptLine(agent: string, message: string): void {
    if (this.currentMeeting) {
      this.currentMeeting.discussionTranscript.push(`[${agent}]: ${message}`);
    }
  }

  public recordProposal(proposal: string): void {
    if (this.currentMeeting) {
      this.currentMeeting.proposedSolutions.push(proposal);
    }
  }

  public recordDecision(decision: string, accepted: boolean): void {
    if (this.currentMeeting) {
      if (accepted) {
        this.currentMeeting.acceptedDecisions.push(decision);
      } else {
        this.currentMeeting.rejectedAlternatives.push(decision);
      }
    }
  }

  public setConsensus(verdict: string, consensusScore: number, reasoning: string): void {
    if (this.currentMeeting) {
      this.currentMeeting.consensusResult = { verdict, consensusScore, reasoning };
    }
  }

  public addActionItem(item: string, assignee: string): void {
    if (this.currentMeeting) {
      this.currentMeeting.actionItems.push(item);
      if (!this.currentMeeting.assignedAgents.includes(assignee)) {
        this.currentMeeting.assignedAgents.push(assignee);
      }
      this.currentMeeting.followUpTasks.push(`Task: ${item} (Assigned: ${assignee})`);
    }
  }

  public finalizeMeeting(approved: boolean = true): MeetingPackage | null {
    if (!this.currentMeeting) return null;
    
    this.currentMeeting.approvalStatus = approved ? 'Approved' : 'Rejected';
    const finalized = { ...this.currentMeeting };
    
    try {
      const brain = container.resolve<any>('MONIBrain');
      if (brain) {
        const history = brain.getHistory();
        if (history && history.recordMilestone) {
          history.recordMilestone(
            'Sprint 6.5',
            'Multi-Agent Collaboration',
            `Recorded AI Engineering Meeting [ID: ${finalized.meetingId}] (Consensus: ${finalized.consensusResult.verdict}, Score: ${finalized.consensusResult.consensusScore}%)`,
            new Date(finalized.timestamp).toISOString().split('T')[0],
            finalized.consensusResult.consensusScore
          );
        }

        const graph = brain.getGraph();
        if (graph && graph.addNode && graph.addEdge) {
          const nodeId = `node-meeting-${finalized.meetingId}`;
          graph.addNode(nodeId, 'Report', `Engineering Meeting: ${finalized.meetingId}`);
          
          finalized.participatingAgents.forEach(agent => {
            const agentNodeId = `node-agent-${agent}`;
            graph.addNode(agentNodeId, 'Service', `Agent: ${agent}`);
            graph.addEdge(agentNodeId, nodeId, 'participated_in');
          });
        }

        const mem = brain.getMemory();
        if (mem && mem.addTask) {
          mem.addTask(`Archived meeting ${finalized.meetingId} under MONIBrain Archive. Verdict: ${finalized.consensusResult.verdict}`, 'completed');
          finalized.actionItems.forEach(action => {
            mem.addTask(`AI action item from meeting ${finalized.meetingId}: ${action}`, 'open');
          });
        }
      }
    } catch (e) {
      console.warn('MeetingRecorder failed to sync with MONIBrain:', e);
    }

    try {
      const archive = container.resolve<any>('MeetingArchive');
      if (archive && archive.saveMeeting) {
        archive.saveMeeting(finalized);
      }
    } catch (e) {
      console.warn('MeetingRecorder failed to save to MeetingArchive:', e);
    }

    this.currentMeeting = null;
    return finalized;
  }

  public getCurrentMeeting(): MeetingPackage | null {
    return this.currentMeeting;
  }
}
