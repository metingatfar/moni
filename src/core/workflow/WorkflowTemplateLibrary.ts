// ===================================================================
// MONI Sprint 7.0 — WorkflowTemplateLibrary.ts
// Centralized library of reusable workflow templates.
// ===================================================================

export interface WorkflowTemplate {
  templateId: string;
  name: string;
  description: string;
  version: string;
  steps: any[];
}

export class WorkflowTemplateLibrary {
  private templates: Map<string, WorkflowTemplate> = new Map();

  constructor() {
    this.registerDefaultTemplates();
  }

  private registerDefaultTemplates(): void {
    this.registerTemplate({
      templateId: 'tpl-backup-secure',
      name: 'Backup & Secure',
      description: 'Creates a local backup, encrypts it, and verifies security integrity.',
      version: '1.0.0',
      steps: [
        { stepId: 's-1', action: 'Create local backup', type: 'sequential', dependencies: [] },
        { stepId: 's-2', action: 'Encrypt backup files', type: 'sequential', dependencies: ['s-1'] },
        { stepId: 's-3', action: 'Verify backup signature', type: 'sequential', dependencies: ['s-2'] }
      ]
    });
    this.registerTemplate({
      templateId: 'tpl-build-deploy',
      name: 'Build & Deploy',
      description: 'Executes project build verification and triggers hot-patch deployment.',
      version: '1.1.0',
      steps: [
        { stepId: 's-1', action: 'Verify quality gates', type: 'sequential', dependencies: [] },
        { stepId: 's-2', action: 'Execute npm run build', type: 'sequential', dependencies: ['s-1'] },
        { stepId: 's-3', action: 'Deploy hot patch to staging', type: 'approval', dependencies: ['s-2'] }
      ]
    });
  }

  registerTemplate(template: WorkflowTemplate): void {
    this.templates.set(template.templateId, template);
  }

  getTemplate(templateId: string): WorkflowTemplate | undefined {
    return this.templates.get(templateId);
  }

  listTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }
}
