import { patchDraft } from './PatchDraft';
import type { PatchDraftData } from './PatchDraft';
import type { CodeGenerationPlanData } from './CodeGenerationPlan';
import { codeTemplatePlanner } from './CodeTemplatePlanner';

export class PatchDraftBuilder {
  public buildDrafts(plan: CodeGenerationPlanData): PatchDraftData[] {
    return plan.targetFiles.map(file => {
      const template = file.includes('Dashboard') ? 'dashboard' : file.includes('Test') ? 'test' : 'service';
      const skeleton = codeTemplatePlanner.planTemplate(template);
      return patchDraft.createDraft(plan.planId, file, 'update', skeleton);
    });
  }
}

export const patchDraftBuilder = new PatchDraftBuilder();
export default patchDraftBuilder;
