import { CollaborationEngine } from './CollaborationEngine';
import { container } from '../container/ServiceContainer';

export interface MultiAgentApprovalPackage {
  packageId: string;
  discussionId: string;
  consensusScore: number;
  finalRecommendation: string;
  verdict: string;
  agentsParticipated: string[];
  timestamp: number;
  dryRunMode: boolean;
}

export class MultiAgentEngine {
  private colEngine = new CollaborationEngine();

  public async coordinateMultiAgentCollaboration(
    userInput: string,
    agents: string[]
  ): Promise<MultiAgentApprovalPackage> {
    const discussionId = `disc-${Date.now()}`;
    const meetingId = `meet-${Date.now()}`;
    
    // 1. Fetch active context from MONIBrain if available
    let brainContextText = 'No persistent context found.';
    try {
      const brain = container.resolve<any>('MONIBrain');
      if (brain) {
        const context = await brain.constructContext(userInput);
        brainContextText = context.rawContext || brainContextText;
      }
    } catch (e) {
      console.warn('MultiAgentEngine failed to retrieve MONIBrain context:', e);
    }

    // 2. Start Meeting Recorder if available
    let meetingRecorder: any = null;
    try {
      meetingRecorder = container.resolve<any>('MeetingRecorder');
      if (meetingRecorder) {
        meetingRecorder.startMeeting(meetingId, agents);
        meetingRecorder.recordQuestion(userInput);
        meetingRecorder.recordTranscriptLine('LeadArchitectAgent', `Analyzing architecture constraints for request: ${userInput}`);
        meetingRecorder.recordTranscriptLine('BackendDeveloperAgent', `Recommending database schema layouts and query adapters.`);
        meetingRecorder.recordTranscriptLine('SecurityEngineerAgent', `Auditing proposed adapter endpoints for gate check validations.`);
      }
    } catch (e) {
      console.warn('MultiAgentEngine failed to initialize MeetingRecorder:', e);
    }

    // 3. Run execution under MONIOperatingSystem if available
    let osSessionName = 'standalone-session';
    try {
      const moniOS = container.resolve<any>('MONIOperatingSystem');
      if (moniOS && moniOS.startWorkflow) {
        const workflow = await moniOS.startWorkflow(`Multi-Agent Collaboration workflow for user query: ${userInput}`);
        osSessionName = workflow.sessionName || osSessionName;
      }
    } catch (e) {
      console.warn('MultiAgentEngine failed to execute under MONIOperatingSystem:', e);
    }

    // 4. Launch CollaborationEngine Session
    const sessionResult = await this.colEngine.runSession(
      discussionId,
      `Multi-Agent analysis for query: ${userInput}. Context: ${brainContextText}`,
      agents
    );

    // 5. Update Reputation Engine stats
    try {
      const repEngine = container.resolve<any>('AgentReputationEngine');
      if (repEngine) {
        const isSuccess = sessionResult.verdict === 'Accepted';
        agents.forEach(agent => {
          repEngine.updateProfile(agent, isSuccess, sessionResult.consensusScore, 'architecture');
        });
      }
    } catch (e) {
      console.warn('MultiAgentEngine failed to update agent reputations:', e);
    }

    // 6. Finalize meeting recording
    if (meetingRecorder) {
      meetingRecorder.setConsensus(
        sessionResult.verdict,
        sessionResult.consensusScore,
        `Consensus computed and finalized on topic: ${userInput}`
      );
      meetingRecorder.recordProposal(sessionResult.finalSolution);
      meetingRecorder.recordDecision(sessionResult.finalSolution, sessionResult.verdict === 'Accepted');
      meetingRecorder.addActionItem('Verify decoupled adapters integration', agents[1] || 'BackendDeveloperAgent');
      meetingRecorder.finalizeMeeting(sessionResult.verdict === 'Accepted');
    }

    // 6.5. Process cognitive learning from workflow outcomes
    try {
      const learning = container.resolve<any>('LearningEngine');
      if (learning && learning.processWorkflowLearning) {
        learning.processWorkflowLearning(
          meetingId,
          userInput,
          [sessionResult.finalSolution],
          sessionResult.consensusScore
        );
      }
    } catch (e) {
      console.warn('MultiAgentEngine failed to process workflow learning:', e);
    }

    // 7. Create Final Recommendation and Approval Package
    const approvalPkg: MultiAgentApprovalPackage = {
      packageId: `col-pkg-${Date.now()}`,
      discussionId,
      consensusScore: sessionResult.consensusScore,
      finalRecommendation: sessionResult.finalSolution,
      verdict: sessionResult.verdict,
      agentsParticipated: agents,
      timestamp: Date.now(),
      dryRunMode: true
    };

    // 8. Persist the final recommendation details back into MONIBrain memory
    try {
      const brain = container.resolve<any>('MONIBrain');
      if (brain && brain.getMemory) {
        const projectMemory = brain.getMemory();
        if (projectMemory && projectMemory.addTask) {
          projectMemory.addTask(`Multi-Agent decision proposed: ${sessionResult.finalSolution} (Verdict: ${sessionResult.verdict})`, 'open');
        }
      }
    } catch (e) {
      console.warn('MultiAgentEngine failed to persist outcomes back into MONIBrain:', e);
    }

    // 9. Publish workflow completion event through the OS Event Bus if available
    try {
      const eventBus = container.resolve<any>('EventBus');
      if (eventBus && eventBus.publish) {
        eventBus.publish('WorkflowExecutionPlanFinished', {
          discussionId,
          verdict: sessionResult.verdict,
          osSessionName
        });
      }
    } catch (e) {
      console.warn('MultiAgentEngine failed to publish complete event through EventBus:', e);
    }

    return approvalPkg;
  }

  public getCollaborationEngine(): CollaborationEngine {
    return this.colEngine;
  }
}
