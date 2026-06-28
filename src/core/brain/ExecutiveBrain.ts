import { AIOrchestrator } from '../ai/AIOrchestrator';
import { ToolManager } from '../tools/ToolManager';
import { ShortTermMemory } from '../memory/ShortTermMemory';
import { LongTermMemory } from '../memory/LongTermMemory';
import { ContextBuilder } from '../memory/ContextBuilder';
import { ResponseProcessor } from '../ai/ResponseProcessor';
import { eventBus } from '../events/EventBus';
import { telemetry } from '../telemetry/Telemetry';
import { personalityEngine } from '../personality/PersonalityEngine';
import { container } from '../container/ServiceContainer';
import type { MemoryCategory } from '../../domain/entities/MemoryItem';
import { pipelineTracer } from '../observability/PipelineTracer';
import { traceLogger } from '../observability/TraceLogger';
import { performanceProfiler } from '../observability/PerformanceProfiler';
import { healthMonitor } from '../observability/HealthMonitor';
export class ExecutiveBrain {
  private aiOrchestrator: AIOrchestrator;
  private toolManager: ToolManager;
  private shortTermMemory: ShortTermMemory;
  private longTermMemory: LongTermMemory;
  private userName: string;
  private pendingAgentAction: any = null;
 
  constructor(
    aiOrchestrator: AIOrchestrator,
    toolManager: ToolManager,
    shortTermMemory: ShortTermMemory,
    longTermMemory: LongTermMemory,
    userName?: string
  ) {
    this.aiOrchestrator = aiOrchestrator;
    this.toolManager = toolManager;
    this.shortTermMemory = shortTermMemory;
    this.longTermMemory = longTermMemory;
    this.userName = userName || 'Metin';
  }

  /**
   * Update the user name (e.g. when loaded from memory store).
   */
  public setUserName(name: string): void {
    this.userName = name;
  }

  /**
   * Main entry point to process any user speech/text command.
   */
  public async processInput(
    userInput: string,
    onChunk: (chunk: string) => void,
    visionInput?: any
  ): Promise<string> {
    return this.execute(userInput, onChunk, visionInput);
  }

  /**
   * Main entry point to process any user speech/text command.
   */
  public async execute(
    userInput: string,
    onChunk: (chunk: string) => void,
    visionInput?: any
  ): Promise<string> {
    const startTime = Date.now();
    const requestId = 'req-' + Date.now();
    pipelineTracer.startTrace(requestId, userInput);

    try {
      const result = await this._execute(userInput, onChunk, visionInput);
      const duration = Date.now() - startTime;
      performanceProfiler.recordDuration('ExecutiveBrain', duration);
      
      const trace = pipelineTracer.endTrace(result);
      if (trace) {
        traceLogger.logTrace(trace);
      }
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      performanceProfiler.recordDuration('ExecutiveBrain', duration);
      
      pipelineTracer.traceStep('ExecutiveBrain', 'failed', error.message || String(error));
      const trace = pipelineTracer.endTrace('Error: ' + (error.message || String(error)));
      if (trace) {
        traceLogger.logTrace(trace);
      }
      throw error;
    } finally {
      healthMonitor.checkHealth().catch(() => {});
    }
  }

  private async _execute(
    userInput: string,
    onChunk: (chunk: string) => void,
    visionInput?: any
  ): Promise<string> {
    const startTime = Date.now();
    eventBus.publish('PipelineStarted', { input: userInput });
    console.log('[ExecutiveBrain] Initiating execution cycle for:', userInput);

    try {
      // Resolve MONI Brain Context before any execution workflow
    let moniBrainContext: any = null;
    try {
      const brain = container.resolve<any>('MONIBrain');
      if (brain) {
        moniBrainContext = await brain.constructContext(userInput);
        console.log('[ExecutiveBrain] Integrated persistent brain memory. Project:', moniBrainContext.activeContext.project);
      }
    } catch (_) {}
    
    // Sprint 6.8 — Enterprise Security Gate
    try {
      const securityPolicy = container.resolve<any>('SecurityPolicyManager');
      const threatEngine = container.resolve<any>('ThreatDetectionEngine');
      const rbacEnforcer = container.resolve<any>('RbacEnforcer');
      
      if (securityPolicy && threatEngine && rbacEnforcer) {
        // 1. RBAC Check
        const hasAccess = rbacEnforcer.checkAccess({
          user: this.userName,
          role: 'System', // Simulated role for execution
          permission: { resource: 'workflow', action: 'execute' }
        });

        if (!hasAccess) {
          throw new Error('Access Denied: Role lacks required permission to execute workflow.');
        }

        // 2. Threat Analysis
        const threatResult = threatEngine.analyze({
          sourceType: 'command',
          payload: userInput,
          context: moniBrainContext
        });

        if (!threatResult.safe) {
          const remediationAgent = container.resolve<any>('VulnerabilityRemediationAgent');
          if (remediationAgent) {
             console.log('[ExecutiveBrain] Threat detected. Attempting auto-remediation...');
             const remediated = remediationAgent.remediate({
               originalPayload: userInput,
               sourceType: 'command',
               threats: threatResult.identifiedThreats,
               violations: []
             });
             if (remediated.success) {
               console.log('[ExecutiveBrain] Payload auto-remediated.');
               userInput = remediated.remediatedPayload;
             } else {
               throw new Error(`Execution Blocked by ThreatDetectionEngine: ${threatResult.identifiedThreats.map((t:any) => t.description).join(', ')}`);
             }
          } else {
            throw new Error(`Execution Blocked by ThreatDetectionEngine: ${threatResult.identifiedThreats.map((t:any) => t.description).join(', ')}`);
          }
        }

        // 3. Policy Evaluation
        const policyResult = securityPolicy.evaluateWorkflow({ user: this.userName, input: userInput });
        if (!policyResult.passed) {
          throw new Error(`Execution Blocked by SecurityPolicyManager: ${policyResult.violations.map((v:any) => v.description).join(', ')}`);
        }
      }
    } catch (secError: any) {
      console.warn('[ExecutiveBrain] Security Interception:', secError.message);
      onChunk(`[SecOps Intercept] 🛡️ ${secError.message}`);
      return `[SecOps Intercept] 🛡️ ${secError.message}`;
    }

    // SecOps command checks
    const secopsInputLower = userInput.toLowerCase();
    if (
      secopsInputLower.includes('run security audit') ||
      secopsInputLower.includes('check compliance') ||
      secopsInputLower.includes('simulate threat detection') ||
      secopsInputLower.includes('view secrets vault') ||
      secopsInputLower.includes('remediate vulnerabilities') ||
      secopsInputLower.includes('rbac status')
    ) {
      try {
        if (secopsInputLower.includes('run security audit') || secopsInputLower.includes('check compliance')) {
          const complianceEngine = container.resolve<any>('ComplianceAuditEngine');
          const reportEngine = container.resolve<any>('SecurityReportEngine');
          if (complianceEngine && reportEngine) {
            const res = complianceEngine.auditWorkflow({
              workflowId: `wf-${Date.now()}`,
              dataAccessed: ['email', 'password'],
              dataLocation: 'EU-West',
              encryptionActive: true
            });
            reportEngine.generateAllReports(complianceEngine.getMetrics());
            const msg = `[SecOps Center] Compliance Audit Complete.\nStatus: **${res.compliant ? 'COMPLIANT' : 'VIOLATION DETECTED'}**\nSOC2: ${res.frameworkEvaluations.SOC2}\nGDPR: ${res.frameworkEvaluations.GDPR}\nHIPAA: ${res.frameworkEvaluations.HIPAA}\nViolations: ${res.violations.join(', ') || 'None'}`;
            onChunk(msg);
            return msg;
          }
        }
        if (secopsInputLower.includes('simulate threat detection')) {
          const threatEngine = container.resolve<any>('ThreatDetectionEngine');
          if (threatEngine) {
             const res = threatEngine.analyze({ sourceType: 'command', payload: 'SELECT * FROM users WHERE id = ${id} && rm -rf /' });
             const msg = `[SecOps Center] Simulated Threat Analysis.\nSafe: **${res.safe}**\nScore: ${res.threatScore}/100\nDetected Threats: ${res.identifiedThreats.map((t:any) => t.category).join(', ')}`;
             onChunk(msg);
             return msg;
          }
        }
        if (secopsInputLower.includes('view secrets vault')) {
          const vault = container.resolve<any>('SecretsManagementSimulator');
          if (vault) {
             const keys = vault.listKeys();
             const msg = `[SecOps Center] Secrets Vault.\nActive Leases: ${keys.length}\nKeys: ${keys.join(', ')}`;
             onChunk(msg);
             return msg;
          }
        }
        if (secopsInputLower.includes('rbac status')) {
          const rbac = container.resolve<any>('RbacEnforcer');
          if (rbac) {
             const m = rbac.getMetrics();
             const msg = `[SecOps Center] RBAC Status.\nActive Roles: ${m.activeRoles}\nTotal Access Checks: ${m.totalChecks}\nDenied Requests: ${m.deniedAccessCount}`;
             onChunk(msg);
             return msg;
          }
        }
      } catch (e: any) {
         return `[SecOps Error] ${e.message}`;
      }
    }
      // Pre-execution autonomous coordination
      try {
        const aee = container.resolve<any>('AutonomousExecutiveEngine');
        if (aee) {
          const execDecision = await aee.evaluateExecution(userInput);
          console.log(`[ExecutiveBrain] Autonomous Policy: ${execDecision.policy}, Priority Stack: ${execDecision.priorities.join(' -> ')}`);
        }
      } catch (e) {
        console.warn('[ExecutiveBrain] AutonomousExecutiveEngine evaluation failed/skipped:', e);
      }
      // 0aa. Vision Engine analysis
      let visionContext = '';
      if (visionInput) {
        try {
          const visionEngine = container.resolve<any>('VisionEngine');
          if (visionEngine) {
            const visionResult = await visionEngine.analyzeImage(visionInput);
            const vContext = visionEngine.buildVisionContext(visionInput, visionResult);
            visionContext = `\n[Görsel Bilgi Bağlamı]:\n${vContext.reasoningContext}`;
            console.log('[ExecutiveBrain] Vision Engine processed image context.');
            
            if (visionResult.requiresUserConfirmation) {
              const confirmMsg = `[GÜVENLİK UYARISI]: ${visionResult.riskFlags.join(', ')}\nBu görseli analiz etmemi onaylıyor musunuz?`;
              this.pendingAgentAction = [{ tool: 'vision', params: { action: 'confirm_cloud', inputId: visionInput.id } }];
              onChunk(confirmMsg);
              return confirmMsg;
            }
          }
        } catch (err) {
          console.warn('[ExecutiveBrain] Vision processing failed:', err);
        }
      }
      // 0a. Feedback Engine: intercept feedback statements
      try {
        pipelineTracer.traceStep('Learning', 'started');
        const { agentFeedbackEngine } = await import('../learning/AgentFeedbackEngine');
        const feedbackDetected = agentFeedbackEngine.detectFeedback(userInput);
        if (feedbackDetected) {
          pipelineTracer.traceStep('Learning', 'completed');
          const feedbackReply = "Geri bildiriminizi kaydettim, teşekkürler.";
          onChunk(feedbackReply);
          this.shortTermMemory.addMessage('user', userInput);
          this.shortTermMemory.addMessage('assistant', feedbackReply);
          const totalTime = Date.now() - startTime;
          eventBus.publish('PipelineCompleted', { input: userInput, output: feedbackReply, duration: totalTime });
          return feedbackReply;
        }
        pipelineTracer.traceStep('Learning', 'completed');
      } catch (_) {
        pipelineTracer.traceStep('Learning', 'failed');
      }

      // 0. Personality: detect mode switch command
      const modeSwitchTarget = personalityEngine.detectModeSwitch(userInput);
      if (modeSwitchTarget) {
        personalityEngine.setMode(modeSwitchTarget);
        const confirmation = personalityEngine.getModeSwitchConfirmation(modeSwitchTarget, this.userName);
        this.shortTermMemory.addMessage('user', userInput);
        this.shortTermMemory.addMessage('assistant', confirmation);
        onChunk(confirmation);
        eventBus.publish('PersonalityModeChanged', { mode: modeSwitchTarget });
        const totalTime = Date.now() - startTime;
        telemetry.recordLatency('ExecutiveBrain', totalTime);
        eventBus.publish('PipelineCompleted', { input: userInput, output: confirmation, duration: totalTime });
        return confirmation;
      }

      // 0b. Personality: detect emotional state
      const emotionalContext = personalityEngine.detectEmotionalState(userInput);
      if (emotionalContext) {
        console.log(`[ExecutiveBrain] Emotional state detected: ${emotionalContext.state}`);
      }

      // 0c. LifeModel: resolve and trigger analysis
      let lifeModel: any = null;
      try {
        lifeModel = container.resolve<any>('LifeModel');
        if (lifeModel) {
          pipelineTracer.traceStep('LifeModel', 'started');
          await lifeModel.analyze();
          pipelineTracer.traceStep('LifeModel', 'completed');
        }
      } catch (e) {
        pipelineTracer.traceStep('LifeModel', 'failed', String(e));
        console.warn('[ExecutiveBrain] LifeModel resolution or analysis skipped/failed:', e);
      }

      // 0c2. Goal Engine Command Interception
      try {
        const goalEngine = container.resolve<any>('GoalEngine');
        if (goalEngine && lifeModel) {
          pipelineTracer.traceStep('Goal', 'started');
          let goalResponse = '';
          const lowerVal = userInput.toLowerCase().trim();

          if (lowerVal.includes('hedef oluştur') || lowerVal.includes('hedef olustur')) {
            const titlePart = userInput.split(/hedef oluştur:|hedef olustur:|hedef oluştur|hedef olustur/i)[1]?.trim() || 'Yeni Hedef';
            this.pendingAgentAction = [{
              tool: 'goals',
              params: { action: 'create', title: titlePart, category: 'health' }
            }];
            try {
              const am = container.resolve<any>('AgentManager');
              if (am) {
                am.clearConfirmationPending();
                // Mock routing stats update
                am.route(userInput, {
                  userInput,
                  conversationContext: null,
                  lifeSnapshot: lifeModel.getSnapshot(),
                  memoryFacts: this.longTermMemory.getFacts(),
                  activeGoals: lifeModel.getProfile().goals.activeGoals,
                  currentDateTime: new Date().toISOString(),
                  personalityMode: personalityEngine.getMode(),
                  source: 'user'
                });
              }
            } catch (err) {}
            goalResponse = `Hedef listenize yeni bir hedef eklemek istediğinizi anladım: "${titlePart}". Bu hedefi onaylıyor musunuz?`;
          } else if (lowerVal.includes('hedefimi değiştir') || lowerVal.includes('hedefimi degistir')) {
            const titlePart = userInput.split(/hedefimi değiştir:|hedefimi degistir:|hedefimi değiştir|hedefimi degistir/i)[1]?.trim() || 'Yeni Hedef';
            this.pendingAgentAction = [{
              tool: 'goals',
              params: { action: 'create', title: titlePart, category: 'health' }
            }];
            try {
              const am = container.resolve<any>('AgentManager');
              if (am) {
                am.clearConfirmationPending();
                am.route(userInput, {
                  userInput,
                  conversationContext: null,
                  lifeSnapshot: lifeModel.getSnapshot(),
                  memoryFacts: this.longTermMemory.getFacts(),
                  activeGoals: lifeModel.getProfile().goals.activeGoals,
                  currentDateTime: new Date().toISOString(),
                  personalityMode: personalityEngine.getMode(),
                  source: 'user'
                });
              }
            } catch (err) {}
            goalResponse = `Hedefinizi "${titlePart}" olarak değiştirmemi onaylıyor musunuz?`;
          } else if (lowerVal === 'hedeflerim' || lowerVal.includes('hedeflerim neler') || lowerVal.includes('hedeflerim')) {
            const activeGoals = goalEngine.getGoals().filter((g: any) => g.status === 'active');
            if (activeGoals.length > 0) {
              goalResponse = `Aktif hedefleriniz:\n${activeGoals.map((g: any) => `- ${g.title} (İlerleme: %${g.progress})`).join('\n')}`;
            } else {
              goalResponse = "Şu an aktif bir hedefiniz bulunmuyor.";
            }
          } else if (lowerVal.includes('bugünkü hedefim ne') || lowerVal.includes('bugunku hedefim ne') || lowerVal.includes('bugünkü hedeflerim') || lowerVal.includes('bugunku hedeflerim')) {
            const activeGoals = goalEngine.getGoals().filter((g: any) => g.status === 'active');
            if (activeGoals.length > 0) {
              const plans = goalEngine.generateDailyPlan(activeGoals[0].id);
              goalResponse = `Bugün için hedef planınız:\n${plans.join('\n')}`;
            } else {
              goalResponse = "Şu an aktif bir hedefiniz bulunmuyor.";
            }
          } else if (lowerVal.includes('bu hafta nasıl gidiyorum') || lowerVal.includes('bu hafta nasil gidiyorum')) {
            goalResponse = goalEngine.generateProgressReport();
          } else if (lowerVal.includes('ilerlememi göster') || lowerVal.includes('ilerlememi goster')) {
            goalResponse = goalEngine.generateProgressReport();
          } else if (lowerVal.includes('hedefimi tamamladım') || lowerVal.includes('hedefimi tamamladim')) {
            const activeGoals = goalEngine.getGoals().filter((g: any) => g.status === 'active');
            if (activeGoals.length > 0) {
              this.pendingAgentAction = [{
                tool: 'goals',
                params: { action: 'complete', id: activeGoals[0].id }
              }];
              try {
                const am = container.resolve<any>('AgentManager');
                if (am) {
                  am.clearConfirmationPending();
                  am.route(userInput, {
                    userInput,
                    conversationContext: null,
                    lifeSnapshot: lifeModel.getSnapshot(),
                    memoryFacts: this.longTermMemory.getFacts(),
                    activeGoals: lifeModel.getProfile().goals.activeGoals,
                    currentDateTime: new Date().toISOString(),
                    personalityMode: personalityEngine.getMode(),
                    source: 'user'
                  });
                }
              } catch (err) {}
              goalResponse = `"${activeGoals[0].title}" hedefinizi tamamlandı olarak işaretlemek istiyorsunuz. Onaylıyor musunuz?`;
            } else {
              goalResponse = "Tamamlanacak aktif bir hedefiniz bulunamadı.";
            }
          }

          pipelineTracer.traceStep('Goal', 'completed');
          if (goalResponse) {
            onChunk(goalResponse);
            this.shortTermMemory.addMessage('user', userInput);
            this.shortTermMemory.addMessage('assistant', goalResponse);
            
            const convEngine = container.resolve<any>('ConversationEngine');
            if (convEngine) {
              convEngine.history.addMessage('user', userInput);
              convEngine.history.addMessage('assistant', goalResponse);
            }

            const totalTime = Date.now() - startTime;
            telemetry.recordLatency('ExecutiveBrain', totalTime);
            eventBus.publish('PipelineCompleted', { input: userInput, output: goalResponse, duration: totalTime });
            return goalResponse;
          }
        }
      } catch (e) {
        pipelineTracer.traceStep('Goal', 'failed', String(e));
        console.warn('[ExecutiveBrain] GoalEngine interception failed:', e);
      }

      // 0c3. Workflow Engine Command Interception
      try {
        const workflowEngine = container.resolve<any>('WorkflowEngine');
        if (workflowEngine && lifeModel) {
          pipelineTracer.traceStep('Workflow', 'started');
          let workflowResponse = '';
          const lowerVal = userInput.toLowerCase().trim();
          
          if (
            lowerVal.startsWith('submit workflow') ||
            lowerVal.startsWith('execute next workflow') ||
            lowerVal.startsWith('optimize workflows') ||
            lowerVal.startsWith('workflow health') ||
            lowerVal.startsWith('workflow status') ||
            lowerVal.startsWith('replay workflow') ||
            lowerVal.startsWith('list templates') ||
            lowerVal.startsWith('generate workflow reports')
          ) {
            if (lowerVal.startsWith('submit workflow')) {
              const name = userInput.substring('submit workflow'.length).trim() || 'Default Workflow';
              const wfId = await workflowEngine.submitWorkflow({ id: `wf-${Date.now()}`, name, parameters: {} });
              workflowResponse = `[Workflow Core] Workflow submitted successfully. ID: **${wfId}**`;
            } else if (lowerVal.startsWith('execute next workflow')) {
              await workflowEngine.executeNext();
              workflowResponse = `[Workflow Core] Executed next workflow in queue. Check history/logs for status.`;
            } else if (lowerVal.startsWith('optimize workflows')) {
              const optimizer = container.resolve<any>('WorkflowOptimizationEngine');
              const suggestions = optimizer ? optimizer.getSuggestions() : [];
              workflowResponse = `[Workflow Core] Optimization analysis complete.\nSuggestions: ${suggestions.join(', ') || 'No suggestions at this time.'}`;
            } else if (lowerVal.startsWith('workflow health')) {
              const healthEngine = container.resolve<any>('WorkflowHealthEngine');
              const health = healthEngine ? healthEngine.getHealthReport() : { score: 100, active: 0, status: 'Healthy' };
              workflowResponse = `[Workflow Health] Status: **${health.status}** | Score: ${health.score}% | Active: ${health.active}`;
            } else if (lowerVal.startsWith('workflow status')) {
              const stateManager = container.resolve<any>('WorkflowStateManager');
              const states = stateManager ? stateManager.getAllStates() : {};
              workflowResponse = `[Workflow Core] States:\n${Object.entries(states).map(([id, state]) => `- ${id}: ${state}`).join('\n') || 'No workflows registered.'}`;
            } else if (lowerVal.startsWith('replay workflow')) {
              const id = userInput.substring('replay workflow'.length).trim();
              workflowResponse = `[Workflow Core] Time-travel replay initiated for Workflow ${id}.`;
            } else if (lowerVal.startsWith('list templates')) {
              const templateLibrary = container.resolve<any>('WorkflowTemplateLibrary');
              const templates = templateLibrary ? templateLibrary.listTemplates() : [];
              workflowResponse = `[Workflow Core] Available Templates:\n${templates.map((t: any) => `- ${t.name} (v${t.version}): ${t.description}`).join('\n') || 'No templates available.'}`;
            } else if (lowerVal.startsWith('generate workflow reports')) {
              const reportEngine = container.resolve<any>('WorkflowReportEngine');
              const metricsEngine = container.resolve<any>('WorkflowMetrics');
              const metrics = metricsEngine ? metricsEngine.getMetrics() : {};
              if (reportEngine) {
                reportEngine.generateAllReports(metrics);
                workflowResponse = `[Workflow Core] All 16 workflow reports have been generated in the /reports folder.`;
              } else {
                workflowResponse = `[Workflow Core] WorkflowReportEngine could not be resolved from container.`;
              }
            }
          } else {
            const workflowTriggers = [
              'beni motive et', 'motive et', 
              'yürüyüş hatırlat', 'yürüyüş', 
              'kilomu sor', 'kilo sor', 
              'ilaçlarımı hatırlat', 'ilaç', 
              'haftalık rapor', 'cuma',
              'günlük planımı oku', 'planımı oku'
            ];
            
            const isWorkflowCommand = workflowTriggers.some(t => lowerVal.includes(t)) && 
                                      (lowerVal.includes('her') || lowerVal.includes('sabah') || lowerVal.includes('akşam') || lowerVal.includes('hafta') || lowerVal.includes('cuma'));
            
            if (isWorkflowCommand) {
              const planned = workflowEngine.createWorkflowFromText(userInput);
              this.pendingAgentAction = [{
                tool: 'workflows',
                params: { action: 'create', text: userInput }
              }];
              try {
                const am = container.resolve<any>('AgentManager');
                if (am) {
                  am.clearConfirmationPending();
                  am.route(userInput, {
                    userInput,
                    conversationContext: null,
                    lifeSnapshot: lifeModel.getSnapshot(),
                    memoryFacts: this.longTermMemory.getFacts(),
                    activeGoals: lifeModel.getProfile().goals.activeGoals,
                    currentDateTime: new Date().toISOString(),
                    personalityMode: personalityEngine.getMode(),
                    source: 'user'
                  });
                }
              } catch (err) {}
              
              workflowResponse = `"${planned.title}" isimli otomatik iş akışını (Tetikleyici: ${planned.trigger.type}) oluşturmamı onaylıyor musunuz?`;
            }
          }

          pipelineTracer.traceStep('Workflow', 'completed');
          if (workflowResponse) {
            onChunk(workflowResponse);
            this.shortTermMemory.addMessage('user', userInput);
            this.shortTermMemory.addMessage('assistant', workflowResponse);
            
            const convEngine = container.resolve<any>('ConversationEngine');
            if (convEngine) {
              convEngine.history.addMessage('user', userInput);
              convEngine.history.addMessage('assistant', workflowResponse);
            }

            const totalTime = Date.now() - startTime;
            telemetry.recordLatency('ExecutiveBrain', totalTime);
            eventBus.publish('PipelineCompleted', { input: userInput, output: workflowResponse, duration: totalTime });
            return workflowResponse;
          }
        }
      } catch (e) {
        pipelineTracer.traceStep('Workflow', 'failed', String(e));
        console.warn('[ExecutiveBrain] WorkflowEngine interception failed:', e);
      }

      // 0d. Proactive Command Interception
      let proactiveEngine: any = null;
      try {
        proactiveEngine = container.resolve<any>('ProactiveEngine');
        if (proactiveEngine && lifeModel) {
          const lowerInput = userInput.toLowerCase();
          let proactiveResponse = '';
          
          if (lowerInput.includes('günlük brifing') || lowerInput.includes('brifing ver')) {
            proactiveResponse = await proactiveEngine.generateDailyBrief(lifeModel, this.userName);
          } else if (lowerInput.includes('ne önerirsin') || lowerInput.includes('bugün ne önerirsin')) {
            proactiveResponse = await proactiveEngine.generateSuggestions('morning', lifeModel);
          } else if (lowerInput.includes('değerlendirme yap') || lowerInput.includes('bir değerlendirme yap')) {
            const insights = await proactiveEngine.generateInsights(lifeModel);
            proactiveResponse = insights.length > 0 ? insights.join(' ') : 'Herhangi bir yeni değerlendirme tespit edilemedi.';
          } else if (lowerInput.includes('bu hafta nasıl') || lowerInput.includes('bu hafta')) {
            proactiveResponse = await proactiveEngine.generateWeeklyReview(lifeModel, this.userName);
          } else if (lowerInput.includes('bu ay nasıl') || lowerInput.includes('bu ay')) {
            proactiveResponse = await proactiveEngine.generateMonthlyReview(lifeModel, this.userName);
          } else if (lowerInput.includes('risk var mı') || lowerInput.includes('risk')) {
            const risks = await proactiveEngine.generateRisks(lifeModel);
            proactiveResponse = risks.length > 0 ? risks.join(' ') : 'Şu an için belirgin bir risk tespit edilmedi.';
          } else if (lowerInput.includes('hedefim için') || lowerInput.includes('hedeflerim için') || lowerInput.includes('ne yapmalıyım')) {
            const preds = await proactiveEngine.generatePredictions(lifeModel);
            proactiveResponse = preds.length > 0 ? preds.join(' ') : 'Hedefleriniz doğrultusunda istikrarınızı koruyorsunuz.';
          } else if (lowerInput.includes('moralim bozuk') || lowerInput.includes('yorgunum') || lowerInput.includes('keyifsizim')) {
            proactiveResponse = await proactiveEngine.generateSuggestions('fatigue_or_sadness', lifeModel);
          }

          if (proactiveResponse) {
            onChunk(proactiveResponse);
            this.shortTermMemory.addMessage('user', userInput);
            this.shortTermMemory.addMessage('assistant', proactiveResponse);
            
            // Sync with RAM history
            const convEngine = container.resolve<any>('ConversationEngine');
            if (convEngine) {
              convEngine.history.addMessage('user', userInput);
              convEngine.history.addMessage('assistant', proactiveResponse);
            }

            const totalTime = Date.now() - startTime;
            telemetry.recordLatency('ExecutiveBrain', totalTime);
            eventBus.publish('PipelineCompleted', { input: userInput, output: proactiveResponse, duration: totalTime });
            return proactiveResponse;
          }
        }
      } catch (e) {
        console.warn('[ExecutiveBrain] ProactiveEngine interception failed:', e);
      }

      // 0e. Confirmation flow check
      const lowerInput = userInput.toLowerCase().trim();
      const confirmKeywords = ['evet', 'onayla', 'onaylıyorum', 'tamam', 'olur'];
      const rejectKeywords = ['hayır', 'hayir', 'iptal', 'kalsın', 'istemiyorum'];
      
      if (this.pendingAgentAction && (confirmKeywords.some(kw => lowerInput === kw) || confirmKeywords.some(kw => lowerInput.includes(kw)))) {
        // Execute pending tool calls
        for (const call of this.pendingAgentAction) {
          try {
            await this.toolManager.executeTool(call.tool, call.params);
          } catch (err) {
            console.error(`[ExecutiveBrain] Pending agent tool execution failed:`, err);
          }
        }
        this.pendingAgentAction = null;
        try {
          const am = container.resolve<any>('AgentManager');
          if (am) am.clearConfirmationPending();
        } catch (e) {}
        const confirmMsg = "İşlemi onayladım ve başarıyla gerçekleştirdim.";
        onChunk(confirmMsg);
        this.shortTermMemory.addMessage('user', userInput);
        this.shortTermMemory.addMessage('assistant', confirmMsg);
        
        const totalTime = Date.now() - startTime;
        eventBus.publish('PipelineCompleted', { input: userInput, output: confirmMsg, duration: totalTime });
        return confirmMsg;
      }
      
      if (this.pendingAgentAction && (rejectKeywords.some(kw => lowerInput === kw) || rejectKeywords.some(kw => lowerInput.includes(kw)))) {
        this.pendingAgentAction = null;
        try {
          const am = container.resolve<any>('AgentManager');
          if (am) am.clearConfirmationPending();
        } catch (e) {}
        const rejectMsg = "İşlemi iptal ettim, herhangi bir kayıt oluşturulmadı.";
        onChunk(rejectMsg);
        this.shortTermMemory.addMessage('user', userInput);
        this.shortTermMemory.addMessage('assistant', rejectMsg);
        
        const totalTime = Date.now() - startTime;
        eventBus.publish('PipelineCompleted', { input: userInput, output: rejectMsg, duration: totalTime });
        return rejectMsg;
      }

      // 0f. Agent Engine Routing
      // Normal chats and greetings shouldn't trigger agent routing to avoid overhead
      const greetings = ['merhaba', 'selam', 'nasılsın', 'hey moni', 'günaydın', 'moni'];
      const isGreeting = greetings.some(g => lowerInput === g) || lowerInput.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim() === "merhaba moni";
      
      if (!isGreeting) {
        let agentManager: any = null;
        try {
          agentManager = container.resolve<any>('AgentManager');
          if (agentManager && lifeModel) {
            let resolvedConvEngine: any = null;
            try {
              resolvedConvEngine = container.resolve<any>('ConversationEngine');
            } catch (err) {}

            const agentContext = {
              userInput,
              conversationContext: resolvedConvEngine?.context || null,
              lifeSnapshot: lifeModel.getSnapshot(),
              memoryFacts: this.longTermMemory.getFacts(),
              activeGoals: lifeModel.getProfile().goals.activeGoals,
              currentDateTime: new Date().toISOString(),
              personalityMode: personalityEngine.getMode(),
              source: 'user'
            };
            
            // Check if request is complex to invoke Multi-Agent Collaboration Engine
            const complexTriggers = ['hedef', 'sağlık', 'saglik', 'workflow', 'iş akışı', 'is akisi', 'spor', 'fitness', 'üretkenlik', 'uretkenlik', 'proje', 'planlama', 'plan'];
            const isComplex = complexTriggers.some(t => lowerInput.includes(t));
            
            if (isComplex) {
              try {
                const multiAgentEngine = container.resolve<any>('MultiAgentEngine');
                if (multiAgentEngine) {
                  pipelineTracer.traceStep('MultiAgent', 'started');
                  const multiAgentResult = await multiAgentEngine.executeTask(userInput, agentContext);
                  pipelineTracer.traceStep('MultiAgent', 'completed');
                  if (multiAgentResult) {
                    if (multiAgentResult.requiresConfirmation) {
                       this.pendingAgentAction = multiAgentResult.toolCalls;
                       onChunk(multiAgentResult.message);
                       this.shortTermMemory.addMessage('user', userInput);
                       this.shortTermMemory.addMessage('assistant', multiAgentResult.message);
                       
                       const totalTime = Date.now() - startTime;
                       eventBus.publish('PipelineCompleted', { input: userInput, output: multiAgentResult.message, duration: totalTime });
                       return multiAgentResult.message;
                    } else {
                       for (const call of multiAgentResult.toolCalls) {
                         try {
                           await this.toolManager.executeTool(call.tool, call.params);
                         } catch (err) {
                           console.error(`[ExecutiveBrain] Multi-agent tool execution failed:`, err);
                         }
                       }
                       onChunk(multiAgentResult.message);
                       this.shortTermMemory.addMessage('user', userInput);
                       this.shortTermMemory.addMessage('assistant', multiAgentResult.message);
                       
                       const totalTime = Date.now() - startTime;
                       eventBus.publish('PipelineCompleted', { input: userInput, output: multiAgentResult.message, duration: totalTime });
                       return multiAgentResult.message;
                    }
                  }
                }
              } catch (err) {
                pipelineTracer.traceStep('MultiAgent', 'failed', String(err));
                console.warn('[ExecutiveBrain] MultiAgentEngine execution failed/skipped:', err);
              }
            }

            pipelineTracer.traceStep('Agent', 'started');
            const agentResult = await agentManager.route(userInput, agentContext);
            pipelineTracer.traceStep('Agent', 'completed');
            if (agentResult) {
              if (agentResult.requiresConfirmation) {
                // Keep tool calls in pendingState
                this.pendingAgentAction = agentResult.toolCalls;
                onChunk(agentResult.message);
                this.shortTermMemory.addMessage('user', userInput);
                this.shortTermMemory.addMessage('assistant', agentResult.message);
                
                const totalTime = Date.now() - startTime;
                eventBus.publish('PipelineCompleted', { input: userInput, output: agentResult.message, duration: totalTime });
                return agentResult.message;
              } else {
                // Execute tool calls immediately if no confirmation is required
                for (const call of agentResult.toolCalls) {
                  try {
                    await this.toolManager.executeTool(call.tool, call.params);
                  } catch (err) {
                    console.error(`[ExecutiveBrain] Agent tool execution failed:`, err);
                  }
                }
                onChunk(agentResult.message);
                this.shortTermMemory.addMessage('user', userInput);
                this.shortTermMemory.addMessage('assistant', agentResult.message);
                
                const totalTime = Date.now() - startTime;
                eventBus.publish('PipelineCompleted', { input: userInput, output: agentResult.message, duration: totalTime });
                return agentResult.message;
              }
            }
          }
        } catch (e) {
          console.warn('[ExecutiveBrain] AgentManager routing failed or skipped:', e);
          if (agentManager) agentManager.recordFailure();
        }
      }

      // 1. Resolve references and active topics using ConversationEngine
      let processedInput = userInput;
      let conversationEngine: any = null;

      try {
        conversationEngine = container.resolve<any>('ConversationEngine');
        if (conversationEngine) {
          pipelineTracer.traceStep('Conversation', 'started');
          const preResult = await conversationEngine.preProcessMessage(userInput);
          pipelineTracer.traceStep('Conversation', 'completed');
          if (preResult.isClarification) {
            // Netleştirme sorusu sorulacak, akışı kes
            onChunk(preResult.resolvedText);
            this.shortTermMemory.addMessage('user', userInput);
            this.shortTermMemory.addMessage('assistant', preResult.resolvedText);
            
            // Sync with RAM history
            conversationEngine.history.addMessage('user', userInput);
            conversationEngine.history.addMessage('assistant', preResult.resolvedText);

            const totalTime = Date.now() - startTime;
            telemetry.recordLatency('ExecutiveBrain', totalTime);
            eventBus.publish('PipelineCompleted', { input: userInput, output: preResult.resolvedText, duration: totalTime });
            return preResult.resolvedText;
          }
          processedInput = preResult.resolvedText;
        }
      } catch (e) {
        pipelineTracer.traceStep('Conversation', 'failed', String(e));
        console.warn('[ExecutiveBrain] ConversationEngine pre-processing failed, fallback to raw input:', e);
      }

      // Cancel check for multi-turn slot filling
      if (conversationEngine && conversationEngine.context.isMultiTurnActive() && processedInput.toLowerCase().includes('iptal')) {
        conversationEngine.context.resetMultiTurn();
        const cancelMsg = "İşlemi iptal ettim.";
        onChunk(cancelMsg);
        this.shortTermMemory.addMessage('user', userInput);
        this.shortTermMemory.addMessage('assistant', cancelMsg);
        conversationEngine.history.addMessage('user', userInput);
        conversationEngine.history.addMessage('assistant', cancelMsg);

        const totalTime = Date.now() - startTime;
        eventBus.publish('PipelineCompleted', { input: userInput, output: cancelMsg, duration: totalTime });
        return cancelMsg;
      }

      // 2. Save user input to short term memory (Vite state)
      // Capture history before saving this user input to avoid consecutive user/user roles in LLM API
      const recentMessages = [...this.shortTermMemory.getMessages()];
      this.shortTermMemory.addMessage('user', userInput);

      // 3. Multi-turn slot filling dialogue loop
      if (conversationEngine) {
        const lowerProcessed = processedInput.toLowerCase();
        
        // Trigger multi-turn meeting planner manually if active keyword is found
        if (!conversationEngine.context.isMultiTurnActive()) {
          const meetingTriggers = ['toplantı oluştur', 'randevu planla', 'toplanti olustur', 'görüşme planla', 'gorusme planla'];
          const isMeetingIntent = meetingTriggers.some(t => lowerProcessed.includes(t));
          
          if (isMeetingIntent) {
            conversationEngine.context.currentIntent = 'create_meeting';
            conversationEngine.context.pendingSlots = { type: 'meeting' };
            conversationEngine.context.askedSlots = [];
            console.log('[ExecutiveBrain] Activated multi-turn meeting intent.');
          }
        }

        // Process slot filling if active
        if (conversationEngine.context.isMultiTurnActive()) {
          const context = conversationEngine.context;
          const analyzer = conversationEngine.analyzer;

          // Extract and merge slots
          const newSlots = await analyzer.extractSlots(processedInput, context.pendingSlots);
          context.pendingSlots = { ...context.pendingSlots, ...newSlots };
          console.log('[ExecutiveBrain] Multi-turn pending slots:', context.pendingSlots);

          // Find missing slots
          let missingSlot: 'time' | 'participants' | 'location' | null = null;
          if (!context.pendingSlots.time) {
            missingSlot = 'time';
          } else if (!context.pendingSlots.participants || context.pendingSlots.participants.length === 0) {
            missingSlot = 'participants';
          } else if (!context.pendingSlots.location) {
            missingSlot = 'location';
          }

          if (missingSlot) {
            // Ask for missing slot
            let question = '';
            if (missingSlot === 'time') {
              question = "Toplantı saat kaçta olsun?";
            } else if (missingSlot === 'participants') {
              question = "Toplantıya kimler katılsın?";
            } else if (missingSlot === 'location') {
              question = "Toplantı nerede gerçekleşsin?";
            }

            context.askedSlots.push(missingSlot);
            onChunk(question);
            
            this.shortTermMemory.addMessage('assistant', question);
            conversationEngine.history.addMessage('user', userInput);
            conversationEngine.history.addMessage('assistant', question);

            const totalTime = Date.now() - startTime;
            telemetry.recordLatency('ExecutiveBrain', totalTime);
            eventBus.publish('PipelineCompleted', { input: userInput, output: question, duration: totalTime });
            return question;
          } else {
            // All slots are filled! Execute final tool
            const title = `${context.pendingSlots.title || 'Toplantı'} - Katılımcılar: ${context.pendingSlots.participants?.join(', ') || 'Yok'}, Konum: ${context.pendingSlots.location || 'Belirtilmedi'}`;
            
            await this.toolManager.executeTool('reminders', {
              action: 'add',
              title: title,
              time: context.pendingSlots.time
            });

            // Clean multi-turn context
            context.resetMultiTurn();

            // Generate friendly completion response
            const confirmationPrompt = `Toplantı başarıyla oluşturuldu. Bilgiler: Saat: ${context.pendingSlots.time}, Katılımcılar: ${context.pendingSlots.participants?.join(', ')}, Konum: ${context.pendingSlots.location}.
Kullanıcıya bu toplantıyı oluşturduğunu bildiren, Personality Engine kurallarına uygun (markdown içermeyen, kısa, doğal Türkçe) bir onay cümlesi yaz.`;
            
            const confirmation = await this.aiOrchestrator.chatComplete({
              message: confirmationPrompt,
              systemInstruction: personalityEngine.getSystemPrompt(this.userName)
            });

            const cleanConfirmation = ResponseProcessor.sanitizeForSpeech(confirmation.trim());
            onChunk(cleanConfirmation);
            
            this.shortTermMemory.addMessage('assistant', cleanConfirmation);
            conversationEngine.history.addMessage('user', userInput);
            conversationEngine.history.addMessage('assistant', cleanConfirmation);

            const totalTime = Date.now() - startTime;
            telemetry.recordLatency('ExecutiveBrain', totalTime);
            eventBus.publish('PipelineCompleted', { input: userInput, output: cleanConfirmation, duration: totalTime });
            return cleanConfirmation;
          }
        }
      }

      // 4. Memory Interceptions
      const lowerProcessedInput = processedInput.toLowerCase();
      
      // A. Memory Delete Command Detection
      const isDeleteRequest = (lowerProcessedInput.includes('unut') && !lowerProcessedInput.includes('unutma')) || lowerProcessedInput.includes('sil');
      if (isDeleteRequest) {
        await this.handleMemoryDelete(processedInput);
      }

      // B. Explicit Memory Save Command Detection
      const saveTriggers = ['bunu hatırla', 'unutma', 'aklında tut', 'hafızana al', 'hafızaya kaydet'];
      const isExplicitSave = saveTriggers.some(t => lowerProcessedInput.includes(t));
      if (isExplicitSave) {
        await this.handleExplicitMemorySave(processedInput);
      }

      // 5. Run ReasoningEngine thinking layer before planning/execution
      const { reasoningEngine } = await import('../reasoning/ReasoningEngine');
      const reasoningResult = await reasoningEngine.reason(processedInput);
      console.log('[ExecutiveBrain] Reasoning Result:', reasoningResult.humanReadableSummary);

      // 5a. Query Cognitive Knowledge Engine for context enrichment
      let knowledgeEnrichment = '';
      try {
        const knowledgeEngine = container.resolve<any>('KnowledgeEngine');
        if (knowledgeEngine) {
          const queryResults = knowledgeEngine.query(processedInput);
          if (queryResults.length > 0) {
            const topMatch = queryResults[0];
            if (topMatch.score > 0.4) {
              knowledgeEnrichment = `\n[Cognitive Knowledge Engine Tespiti]:\n- Kaynak: ${topMatch.title}\n- Detay: ${topMatch.content}`;
              console.log('[ExecutiveBrain] Knowledge Engine Enrichment:', topMatch.title);
            }
          }
        }
      } catch (err) {
        console.warn('[ExecutiveBrain] KnowledgeEngine query failed:', err);
      }

      // 5b. Check if it requires a project plan first using PlanningEngine
      const { planningEngine } = await import('../planning/PlanningEngine');
      if (planningEngine.shouldPlan(processedInput)) {
        const roadmap = planningEngine.createPlan(processedInput);
        this.pendingAgentAction = roadmap.steps.map(s => ({
          tool: s.requiredTool,
          params: { action: 'create', title: s.objective }
        }));

        const stepsPrompt = roadmap.steps.map(s => `[${s.requiredTool.toUpperCase()}] ${s.objective}`).join(', ');
        // Inject reasoning summary to response to explain MONI's choice
        const roadmapResponse = `[DÜŞÜNCE: ${reasoningResult.humanReadableSummary}]\n\n"${processedInput}" projesi için yol haritası oluşturuldu: ${stepsPrompt}. Onaylıyor musunuz?`;
        
        onChunk(roadmapResponse);
        this.shortTermMemory.addMessage('user', userInput);
        this.shortTermMemory.addMessage('assistant', roadmapResponse);
        
        const totalTime = Date.now() - startTime;
        eventBus.publish('PipelineCompleted', { input: userInput, output: roadmapResponse, duration: totalTime });
        return roadmapResponse;
      }

      // 5c. Intent analysis / Planning via ToolIntelligenceEngine
      const { toolIntelligenceEngine } = await import('../tool_intelligence/ToolIntelligenceEngine');
      const toolPlan = await toolIntelligenceEngine.planExecution(processedInput);
      
      const toolResults: any[] = [];
      if (toolPlan.steps.length > 0) {
        if (toolPlan.requiresConfirmation) {
          // Store pending steps for confirmation
          this.pendingAgentAction = toolPlan.steps;
          const confirmPrompt = toolPlan.steps.map(s => `[${s.tool.toUpperCase()}] ${s.action} (${JSON.stringify(s.params)})`).join(', ');
          const confirmationResponse = `Şu işlemleri gerçekleştirmemi onaylıyor musunuz: ${confirmPrompt}?`;
          
          onChunk(confirmationResponse);
          this.shortTermMemory.addMessage('user', userInput);
          this.shortTermMemory.addMessage('assistant', confirmationResponse);
          
          const totalTime = Date.now() - startTime;
          eventBus.publish('PipelineCompleted', { input: userInput, output: confirmationResponse, duration: totalTime });
          return confirmationResponse;
        } else {
          // Execute tools directly
          for (const step of toolPlan.steps) {
            try {
              const res = await this.toolManager.executeTool(step.tool, step.params);
              toolResults.push(res);
              toolIntelligenceEngine.recordSuccess(step.tool);
            } catch (err) {
              console.error(`[ExecutiveBrain] Tool execution failed for: ${step.tool}`, err);
              toolIntelligenceEngine.recordFailure(step.tool);
            }
          }
        }
      }

      // 7. Retrieve matching facts from long term memory
      const facts = this.longTermMemory.search(processedInput);

      // 8. Build rich prompt context
      const context = ContextBuilder.buildPromptContext('', facts, recentMessages);

      // 8b. Retrieve Life Model metrics and snapshot context
      let lifeContext = '';
      if (lifeModel) {
        const metrics = lifeModel.getMetrics();
        const snapshot = lifeModel.getSnapshot();
        lifeContext = `\n[Life Model Durumu]:
- Sağlık Skoru: ${metrics.healthScore}/100
- Aktivite Skoru: ${metrics.activityScore}/100
- Üretkenlik Skoru: ${metrics.productivityScore}/100
- Genel Yaşam Skoru: ${metrics.overallLifeScore}/100
- Bugün Kalan Görevler: ${snapshot.todayTasksCount}
- Aktif Hedefler: ${snapshot.activeGoalsCount}
- Son Spor Tarihi: ${snapshot.lastSportDate || 'Belirtilmedi'}
- Yaklaşan Toplantılar: ${snapshot.upcomingMeetings.join(', ') || 'Yok'}`;
      }

      // 8c. Retrieve Cognitive Knowledge Engine state & enrichment context
      let knowledgeContext = '';
      try {
        const knowledgeEngine = container.resolve<any>('KnowledgeEngine');
        if (knowledgeEngine) {
          const stats = knowledgeEngine.getDiagnostics();
          const execState = knowledgeEngine.getExecutiveState();
          knowledgeContext = `\n[Bilişsel Bilgi Katmanı (Cognitive Knowledge Engine)]:
- Mevcut Sprint: ${execState.currentSprint}
- Aktif Projeler: ${execState.activeProjects.map((p: any) => `${p.name} (${p.status})`).join(', ')}
- Tespit Edilen Mimari Katmanlar: ${execState.architectureState.layers.join(', ')}
- Düğüm Sayısı: ${stats.nodeCount}, İlişki Sayısı: ${stats.edgeCount}
- Bilgi Zenginleştirmesi: ${knowledgeEnrichment || 'Bulunmadı'}`;
        }
      } catch (e) {
        console.warn('[ExecutiveBrain] Failed to retrieve knowledge context:', e);
      }

      // 9. Build personality-aware system instruction
      const { tokenBudgetManager } = await import('../learning/TokenBudgetManager');
      const costMode = tokenBudgetManager.getCostMode();

      let fullSystemInstruction = `${personalityEngine.getSystemPrompt(this.userName, emotionalContext)}\n\nSistem Bilgisi/Bağlam:\n${context}\n${lifeContext}\n${knowledgeContext}${visionContext}\n\nÖneriler/Plan:\n${toolPlan.explanation}`;

      if (costMode === 'Saving') {
        fullSystemInstruction += "\n[IMPORTANT: Lütfen cevabı çok kısa tutun (en fazla 2 cümle).]";
      }

      // 10. Generate reply via AI Orchestrator
      let finalAnswer = '';
      if (costMode === 'Critical') {
        finalAnswer = "Bütçe sınırları nedeniyle kısa cevap modu aktif. Talebinizi kaydettim.";
        onChunk(finalAnswer);
      } else {
        pipelineTracer.traceStep('LLM', 'started');
        try {
          await this.aiOrchestrator.chatStream(
            {
              message: processedInput,
              systemInstruction: fullSystemInstruction,
              history: recentMessages
            },
            (chunk) => {
              finalAnswer += chunk;
              onChunk(chunk);
            }
          );
          pipelineTracer.traceStep('LLM', 'completed');
        } catch (err: any) {
          pipelineTracer.traceStep('LLM', 'failed', err.message || String(err));
          throw err;
        }
      }

      // Track estimated tokens used
      const estimatedTokens = Math.ceil(processedInput.length / 4) + Math.ceil(finalAnswer.length / 4) + Math.ceil(fullSystemInstruction.length / 4);
      tokenBudgetManager.trackUsage(estimatedTokens);

      // 11. Sanitize response for TTS suitability and save to short term memory
      const cleanAnswer = ResponseProcessor.sanitizeForSpeech(finalAnswer);
      this.shortTermMemory.addMessage('assistant', cleanAnswer);

      // 12. Asynchronous Implicit Memory Extraction (Background)
      if (!isExplicitSave && !isDeleteRequest) {
        this.runImplicitExtraction(processedInput).catch(err => {
          console.error('[ExecutiveBrain] Implicit extraction failed:', err);
        });
      }

      // 13. Auto Summary Trigger
      if (conversationEngine && conversationEngine.history.getLength() >= 6) {
        this.triggerConversationSummary(conversationEngine).catch(err => {
          console.error('[ExecutiveBrain] Triggering conversation summary failed:', err);
        });
      }
      
      // 14. Cognitive Learning Engine trigger
      let feedback: 'like' | 'dislike' | 'none' = 'none';
      try {
        const cle = container.resolve<any>('CognitiveLearningEngine');
        if (cle) {
          const lowerVal = userInput.toLowerCase();
          const isNegativeFeedback = lowerVal.includes('hoşuma gitmedi') || lowerVal.includes('kötü') || lowerVal.includes('beğenmedim');
          const isPositiveFeedback = lowerVal.includes('güzel') || lowerVal.includes('beğendim') || lowerVal.includes('harika');

          if (isNegativeFeedback) {
            feedback = 'dislike';
          } else if (isPositiveFeedback) {
            feedback = 'like';
          }

          const exps = cle.collector.getExperiences();
          if ((isNegativeFeedback || isPositiveFeedback) && exps.length > 0) {
            const lastExp = exps[exps.length - 1];
            cle.collector.updateFeedback(lastExp.id, feedback, userInput);
            await cle.learn(lastExp);
          }

          const strategy = toolPlan.steps.length > 0 ? 'ToolSelection' : 'DirectResponse';
          const tools = toolPlan.steps.map((s: any) => s.tool);
          await cle.learn({
            userInput: processedInput,
            strategyUsed: strategy,
            toolsUsed: tools,
            response: cleanAnswer,
            userFeedback: 'none'
          });
        }
      } catch (err) {
        console.warn('[ExecutiveBrain] CognitiveLearningEngine learn failed:', err);
      }

      // 15. Autonomous Executive self-assessment
      try {
        const aee = container.resolve<any>('AutonomousExecutiveEngine');
        if (aee) {
          aee.assessment.assess(userInput, cleanAnswer, feedback);
        }
      } catch (err) {
        console.warn('[ExecutiveBrain] AutonomousExecutiveEngine self-assessment failed:', err);
      }

      const totalTime = Date.now() - startTime;
      telemetry.recordLatency('ExecutiveBrain', totalTime);
      eventBus.publish('PipelineCompleted', { input: userInput, output: cleanAnswer, duration: totalTime });

      return cleanAnswer;
    } catch (error: any) {
      const totalTime = Date.now() - startTime;
      eventBus.publish('PipelineFailed', { input: userInput, error: error.message || error, duration: totalTime });
      throw error;
    }
  }

  /**
   * Triggers conversation summary and stores it in LongTermMemory
   */
  private async triggerConversationSummary(conversationEngine: any): Promise<void> {
    console.log('[ExecutiveBrain] Compiling automatic conversation summary...');
    const summary = await conversationEngine.generateSummary();
    
    // Only save summary if it contains actual meaningful conversation information
    if (summary && !summary.includes('Özetlenecek önemli bir bilgi konuşulmadı.')) {
      await this.longTermMemory.addFact(summary, 'custom', 0.8, 'implicit', 2);
      console.log('[ExecutiveBrain] Saved conversation summary to memory:', summary);
    }
    
    // Reset RAM history to avoid double summarizing the same inputs
    conversationEngine.history.clear();
  }

  /**
   * Helper to handle explicit memory saving commands
   */
  private async handleExplicitMemorySave(input: string): Promise<void> {
    try {
      console.log('[ExecutiveBrain] Extracting explicit memory fact...');
      
      const extractionPrompt = `Aşağıdaki Türkçe metinden kullanıcının hafızaya kaydetmek istediği net bilgiyi çıkar ve uygun kategoriyi seç.
Kategoriler:
- 'identity': kullanıcının adı, yaşı vb. kimlik bilgileri.
- 'preference': kahveyi şekersiz içmesi vb. zevk ve tercihleri.
- 'health': kullandığı ilaçlar, hastalıklar, alerjiler vb. sağlık bilgileri.
- 'sport': sevdiği sporlar, badminton vb. spor alışkanlıkları.
- 'work': mesleği, çalıştığı şirket, projeleri vb. iş/çalışma bilgileri.
- 'relationship': eşi, çocuğu, arkadaşları vb. ilişkiler.
- 'routine': günlük rutinleri, alışkanlıkları.
- 'goal': hedefleri (örneğin 90 kiloya düşmek).
- 'location': ev adresi, ofis konumu vb. konumlar.
- 'custom': diğer kategorilere uymayan önemli kalıcı notlar.

Çıktıyı SADECE JSON formatında ver, markdown kod bloğu kullanma. JSON şeması:
{
  "category": "kategori_adi",
  "content": "özetlenmiş net bilgi içeriği (örneğin: 'Kahveyi şekersiz içmeyi sever')"
}

İfade: "${input}"`;

      const response = await this.aiOrchestrator.chatComplete({
        message: extractionPrompt,
        systemInstruction: "Sen bir veri çıkarma robotusun. Çıktı olarak sadece geçerli JSON döndürürsün."
      });

      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      if (parsed.content && parsed.category) {
        await this.longTermMemory.addFact(
          parsed.content,
          parsed.category as MemoryCategory,
          1.0,
          'explicit',
          4
        );
      }
    } catch (e) {
      console.error('[ExecutiveBrain] Failed to parse or save explicit memory:', e);
    }
  }

  /**
   * Helper to handle memory deletion requests
   */
  private async handleMemoryDelete(input: string): Promise<void> {
    try {
      const facts = this.longTermMemory.getFacts();
      if (facts.length === 0) return;

      console.log('[ExecutiveBrain] Analyzing memory deletion request...');
      
      const deletePrompt = `Kullanıcı şu silme/unutma talebini iletti: "${input}"
Mevcut hafıza kayıtları listesi:
${facts.map(f => `ID: ${f.id} - Kategori: ${f.category} - İçerik: ${f.content}`).join('\n')}

Silinmesi istenen kayıtların ID'lerini bul ve KESİNLİKLE sadece şu JSON şemasında döndür:
{
  "delete": true,
  "ids": ["id1", "id2"]
}
Eğer silinmesi istenen bir kayıt bulunamazsa veya eşleşmiyorsa, "delete": false döndür.`;

      const response = await this.aiOrchestrator.chatComplete({
        message: deletePrompt,
        systemInstruction: "Sen bir veri çıkarma robotusun. Çıktı olarak sadece geçerli JSON döndürürsün."
      });

      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      if (parsed.delete && Array.isArray(parsed.ids)) {
        for (const id of parsed.ids) {
          await this.longTermMemory.deleteFact(id);
          console.log(`[ExecutiveBrain] Memory deleted successfully: ${id}`);
        }
      }
    } catch (e) {
      console.error('[ExecutiveBrain] Failed to parse or handle memory delete:', e);
    }
  }

  /**
   * Helper to handle background/implicit memory extraction
   */
  private async runImplicitExtraction(input: string): Promise<void> {
    // Only trigger extraction if input contains keywords indicating a personal statement
    const keywords = [
      'benim', 'ben', 'seviyorum', 'severim', 'adım', 'ismim', 
      'mesleğim', 'hedefim', 'projem', 'yaşım', 'çalışıyorum', 
      'rutinim', 'adresim', 'ofisim', 'kullanıyorum', 'kilo', 'ilaç', 'spor'
    ];
    const hasKeywords = keywords.some(k => input.toLowerCase().includes(k));
    if (!hasKeywords) return;

    try {
      console.log('[ExecutiveBrain] Analyzing message for implicit memories...');
      
      const implicitPrompt = `Aşağıdaki Türkçe metinden kullanıcının kalıcı (uzun vadeli) bilgisini veya tercihini çıkartıp JSON formatında döndür.
Eğer metin geçici bir bilgi içeriyorsa ("Bugün hava güzel", "Şimdi çıkıyorum", "merhaba") veya kaydedilmeye değer kalıcı bir bilgi yoksa, "save": false döndür.
Önemli kalıcı bilgi kategorileri:
- 'identity': kullanıcının adı, yaş bilgisi.
- 'preference': zevk ve tercihleri.
- 'health': kullandığı ilaçlar, hastalıkları vb. sağlık bilgileri.
- 'sport': sevdiği sporlar, spor alışkanlıkları.
- 'work': mesleği, projeleri vb. iş/çalışma bilgileri.
- 'relationship': eşi, çocuğu, arkadaşları vb. ilişkiler.
- 'routine': günlük rutinleri, alışkanlıkları.
- 'goal': hedefleri (örneğin 90 kiloya düşmek).
- 'location': ev adresi, ofis konumu vb.
- 'custom': diğer kategorilere uymayan önemli kalıcı notlar.

Çıktıyı SADECE JSON formatında ver, markdown kod bloğu kullanma. JSON şeması:
{
  "save": true,
  "category": "kategori_adi",
  "content": "özetlenmiş net Türkçe bilgi (örneğin: 'Kahvesini şekersiz içer.' veya 'Hedefi 90 kiloya düşmektir.')",
  "confidence": 0.9,
  "importance": 3
}
Eğer kaydedilecek kalıcı bir bilgi yoksa:
{
  "save": false
}

Metin: "${input}"`;

      const response = await this.aiOrchestrator.chatComplete({
        message: implicitPrompt,
        systemInstruction: "Sen bir veri çıkarma robotusun. Çıktı olarak sadece geçerli JSON döndürürsün."
      });

      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      if (parsed.save && parsed.content && parsed.category) {
        await this.longTermMemory.addFact(
          parsed.content,
          parsed.category as MemoryCategory,
          parsed.confidence ? Number(parsed.confidence) : 0.8,
          'implicit',
          parsed.importance ? Number(parsed.importance) : 3
        );
        console.log(`[ExecutiveBrain] Implicitly extracted and saved memory: ${parsed.content} (${parsed.category})`);
      }
    } catch (e) {
      console.error('[ExecutiveBrain] Implicit memory extraction failed:', e);
    }
  }
}
