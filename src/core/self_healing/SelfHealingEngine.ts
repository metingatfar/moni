import { HealingCoordinator } from './HealingCoordinator';
import { SelfHealingMetrics } from './SelfHealingMetrics';
import { selfHealingReport } from './SelfHealingReport';
import { DependencyRepairEngine } from './DependencyRepairEngine';
import { PerformanceRepairEngine } from './PerformanceRepairEngine';
import { SecurityRepairEngine } from './SecurityRepairEngine';
import { ArchitectureRepairEngine } from './ArchitectureRepairEngine';
import { TestFailureAnalyzer } from './TestFailureAnalyzer';
import { AIReasoningValidator } from './AIReasoningValidator';
import type { HealingApprovalPackage } from './ApprovalPackageGenerator';

export class SelfHealingEngine {
  private coordinator = new HealingCoordinator();
  private metrics = new SelfHealingMetrics();
  private depRepair = new DependencyRepairEngine();
  private perfRepair = new PerformanceRepairEngine();
  private secRepair = new SecurityRepairEngine();
  private archRepair = new ArchitectureRepairEngine();
  private testAnalyzer = new TestFailureAnalyzer();
  private aiValidator = new AIReasoningValidator();

  public async runSelfHealing(
    errorLogs: string,
    targetFile: string
  ): Promise<HealingApprovalPackage> {
    // 1. Diagnostics, planning, validation, regression checks, and patch proposal via coordinator
    const pkg = await this.coordinator.coordinateRepair(errorLogs, targetFile);

    // 2. Extra diagnostic pipeline engines verification
    this.depRepair.repairDependencies(targetFile, 'mock-dependency-lib');
    this.perfRepair.suggestPerformanceFix(targetFile, 'Memory Leak / Rendering Bottleneck');
    this.secRepair.suggestSecurityFix(targetFile, 'A01:2021-Broken Access Control');
    this.archRepair.repairArchitecture(targetFile, 'Layer Violation Issue');
    this.testAnalyzer.analyzeTestFailure('test_self_healing_unit', errorLogs);

    // AI Reasoning review check
    this.aiValidator.validatePlan(pkg.patch.patchContent, { dependenciesResolved: true });

    // 3. Record metric event
    const healingSuccess = pkg.regressionAnalysis.safeToApply;
    this.metrics.recordEvent(healingSuccess);

    // 4. Generate the 15 reports
    const summary = this.metrics.getSummary();
    selfHealingReport.writeAllHealingReports(pkg, summary);

    return pkg;
  }

  public getMetrics(): SelfHealingMetrics {
    return this.metrics;
  }
}

export const selfHealingEngine = new SelfHealingEngine();
export default selfHealingEngine;
