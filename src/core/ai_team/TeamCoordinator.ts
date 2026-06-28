import { LeadArchitectAgent } from './LeadArchitectAgent';
import { BackendDeveloperAgent } from './BackendDeveloperAgent';
import { FrontendDeveloperAgent } from './FrontendDeveloperAgent';
import { MobileDeveloperAgent } from './MobileDeveloperAgent';
import { DatabaseArchitectAgent } from './DatabaseArchitectAgent';
import { DevOpsEngineerAgent } from './DevOpsEngineerAgent';
import { SecurityEngineerAgent } from './SecurityEngineerAgent';
import { PerformanceEngineerAgent } from './PerformanceEngineerAgent';
import { QAEngineerAgent } from './QAEngineerAgent';
import { DocumentationEngineerAgent } from './DocumentationEngineerAgent';
import { UXReviewerAgent } from './UXReviewerAgent';
import { CodeReviewerAgent } from './CodeReviewerAgent';
import { RefactoringAgent } from './RefactoringAgent';
import { BugHunterAgent } from './BugHunterAgent';
import { StaticAnalysisAgent } from './StaticAnalysisAgent';
import { DependencyAuditAgent } from './DependencyAuditAgent';

export interface CompiledTeamReviews {
  architectReview: any;
  backendReview: any;
  frontendReview: any;
  mobileReview: any;
  databaseReview: any;
  devopsReview: any;
  securityReview: any;
  performanceReview: any;
  qaReview: any;
  docsReview: any;
  uxReview: any;
  codeReview: any;
  refactoringReview: any;
  bugReview: any;
  staticAnalysisReview: any;
  dependencyReview: any;
}

export class TeamCoordinator {
  private architect = new LeadArchitectAgent();
  private backend = new BackendDeveloperAgent();
  private frontend = new FrontendDeveloperAgent();
  private mobile = new MobileDeveloperAgent();
  private database = new DatabaseArchitectAgent();
  private devops = new DevOpsEngineerAgent();
  private security = new SecurityEngineerAgent();
  private performance = new PerformanceEngineerAgent();
  private qa = new QAEngineerAgent();
  private docs = new DocumentationEngineerAgent();
  private ux = new UXReviewerAgent();
  private codeReviewer = new CodeReviewerAgent();
  private refactoring = new RefactoringAgent();
  private bugHunter = new BugHunterAgent();
  private staticAnalysis = new StaticAnalysisAgent();
  private dependencyAudit = new DependencyAuditAgent();

  public compileTeamReviews(blueprint: any): CompiledTeamReviews {
    return {
      architectReview: this.architect.reviewArchitecture(blueprint),
      backendReview: this.backend.reviewBackend(blueprint),
      frontendReview: this.frontend.reviewFrontend(blueprint),
      mobileReview: this.mobile.reviewMobile(blueprint),
      databaseReview: this.database.reviewDatabase(blueprint),
      devopsReview: this.devops.reviewDevOps(blueprint),
      securityReview: this.security.reviewSecurity(blueprint),
      performanceReview: this.performance.reviewPerformance(blueprint),
      qaReview: this.qa.reviewQA(blueprint),
      docsReview: this.docs.reviewDocumentation(blueprint),
      uxReview: this.ux.reviewUX(blueprint),
      codeReview: this.codeReviewer.reviewCode(blueprint),
      refactoringReview: this.refactoring.planRefactoring(blueprint),
      bugReview: this.bugHunter.detectBugs(blueprint),
      staticAnalysisReview: this.staticAnalysis.runStaticAnalysis(blueprint),
      dependencyReview: this.dependencyAudit.auditDependencies(blueprint)
    };
  }
}
