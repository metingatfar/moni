import { container } from '../container/ServiceContainer';
import type { MeetingPackage } from './MeetingRecorder';

export interface ReplayFrame {
  timestamp: number;
  phase: 'Initialization' | 'Questioning' | 'Debate' | 'Consensus' | 'Finalization';
  activeAgent: string;
  transcriptLine: string;
  consensusProgressScore: number;
  currentVerdict: string;
}

export class MeetingReplayEngine {
  public generateReplayFrames(meetingId: string): ReplayFrame[] {
    try {
      const archive = container.resolve<any>('MeetingArchive');
      if (!archive) return [];
      
      const meeting: MeetingPackage = archive.getMeetingById(meetingId);
      if (!meeting) return [];

      const frames: ReplayFrame[] = [];
      const baseTime = meeting.timestamp;

      frames.push({
        timestamp: baseTime,
        phase: 'Initialization',
        activeAgent: 'Coordinator',
        transcriptLine: `Meeting started with agents: ${meeting.participatingAgents.join(', ')}`,
        consensusProgressScore: 0,
        currentVerdict: 'Requires Discussion'
      });

      meeting.questions.forEach((q, idx) => {
        frames.push({
          timestamp: baseTime + 1000 + (idx * 500),
          phase: 'Questioning',
          activeAgent: meeting.participatingAgents[0] || 'LeadArchitectAgent',
          transcriptLine: `Question posed: ${q}`,
          consensusProgressScore: 10,
          currentVerdict: 'Requires Discussion'
        });
      });

      meeting.discussionTranscript.forEach((tLine, idx) => {
        let agent = 'Unknown';
        let cleanText = tLine;
        const match = tLine.match(/^\[([^\]]+)\]:\s*(.*)$/);
        if (match) {
          agent = match[1];
          cleanText = match[2];
        }

        frames.push({
          timestamp: baseTime + 2000 + (idx * 1000),
          phase: 'Debate',
          activeAgent: agent,
          transcriptLine: cleanText,
          consensusProgressScore: Math.min(80, 20 + (idx * 15)),
          currentVerdict: 'Requires Discussion'
        });
      });

      frames.push({
        timestamp: baseTime + 2000 + (meeting.discussionTranscript.length * 1000),
        phase: 'Consensus',
        activeAgent: 'ConsensusEngine',
        transcriptLine: `Consensus computed: Score = ${meeting.consensusResult.consensusScore}%, Verdict = ${meeting.consensusResult.verdict} (Reason: ${meeting.consensusResult.reasoning})`,
        consensusProgressScore: meeting.consensusResult.consensusScore,
        currentVerdict: meeting.consensusResult.verdict
      });

      frames.push({
        timestamp: baseTime + 3000 + (meeting.discussionTranscript.length * 1000),
        phase: 'Finalization',
        activeAgent: 'Coordinator',
        transcriptLine: `Meeting finalized with Status: ${meeting.approvalStatus}. Decisions: ${meeting.acceptedDecisions.join(' | ')}. Assigned: ${meeting.assignedAgents.join(', ')}`,
        consensusProgressScore: meeting.consensusResult.consensusScore,
        currentVerdict: meeting.consensusResult.verdict
      });

      return frames;
    } catch (e) {
      console.warn('Replay engine failing to generate replay frames:', e);
    }
    return [];
  }
}
