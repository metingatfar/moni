import type { BuilderComponent } from './BuilderComponent';

export class ConstraintEngine {
  public applyConstraints(
    comp: BuilderComponent,
    widthMode: 'fixed' | 'fill' | 'hug' | 'responsive',
    heightMode: 'fixed' | 'fill' | 'hug' | 'responsive',
    options?: { widthVal?: number; heightVal?: number; pinnedEdges?: string[] }
  ): void {
    comp.constraints.widthMode = widthMode;
    comp.constraints.heightMode = heightMode;
    if (options?.widthVal !== undefined) comp.constraints.widthVal = options.widthVal;
    if (options?.heightVal !== undefined) comp.constraints.heightVal = options.heightVal;
    if (options?.pinnedEdges !== undefined) comp.constraints.pinnedEdges = options.pinnedEdges;
  }

  public resolveCalculatedSize(
    comp: BuilderComponent,
    parentWidth: number,
    parentHeight: number,
    contentSize = { width: 80, height: 32 }
  ): { width: number; height: number } {
    let width = comp.constraints.widthVal || 100;
    let height = comp.constraints.heightVal || 40;

    // width Mode
    if (comp.constraints.widthMode === 'fill') {
      width = parentWidth;
    } else if (comp.constraints.widthMode === 'hug') {
      width = contentSize.width;
    } else if (comp.constraints.widthMode === 'responsive') {
      width = Math.round(parentWidth * 0.8);
    }

    // height Mode
    if (comp.constraints.heightMode === 'fill') {
      height = parentHeight;
    } else if (comp.constraints.heightMode === 'hug') {
      height = contentSize.height;
    } else if (comp.constraints.heightMode === 'responsive') {
      height = Math.round(parentHeight * 0.15);
    }

    return { width, height };
  }
}
