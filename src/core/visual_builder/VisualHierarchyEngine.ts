import type { BuilderComponent } from './BuilderComponent';

export interface ComponentTreeNode {
  id: string;
  type: string;
  label: string;
  children: ComponentTreeNode[];
}

export class VisualHierarchyEngine {
  public buildComponentTree(components: BuilderComponent[]): ComponentTreeNode {
    // Builds a hierarchy where containers (like Cards, Forms, Modals) can hold other components
    const rootNode: ComponentTreeNode = {
      id: 'root-viewport',
      type: 'Viewport',
      label: 'App Screen Viewport',
      children: []
    };

    // Simple heuristic: If component is inside a card/form boundary, treat it as child
    const containers = components.filter(c => ['Card', 'Form', 'Modal', 'Sidebar'].includes(c.type));
    const elements = components.filter(c => !['Card', 'Form', 'Modal', 'Sidebar'].includes(c.type));

    const containerNodesMap = new Map<string, ComponentTreeNode>();

    containers.forEach(c => {
      const node: ComponentTreeNode = {
        id: c.id,
        type: c.type,
        label: c.properties.label || c.id,
        children: []
      };
      containerNodesMap.set(c.id, node);
      rootNode.children.push(node);
    });

    elements.forEach(el => {
      const node: ComponentTreeNode = {
        id: el.id,
        type: el.type,
        label: el.properties.label || el.id,
        children: []
      };

      // Find closest container that bounds this element coordinate-wise
      let placed = false;
      for (const parent of containers) {
        // Mock check: if Y coordinate is within parent bounding range
        if (el.y > parent.y && el.y < parent.y + 200 && el.x > parent.x && el.x < parent.x + 300) {
          const parentNode = containerNodesMap.get(parent.id);
          if (parentNode) {
            parentNode.children.push(node);
            placed = true;
            break;
          }
        }
      }

      if (!placed) {
        rootNode.children.push(node);
      }
    });

    return rootNode;
  }

  public validateHierarchy(components: BuilderComponent[]): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // Rule 1: No heading skipping (mock validation check)
    const headings = components.filter(c => c.type === 'Text' && c.properties.label?.toLowerCase().includes('heading'));
    if (headings.length > 5) {
      warnings.push('Too many heavy heading text elements. Simplify layout layout density.');
    }

    // Rule 2: Ensure buttons have accessibility labels
    components.forEach(c => {
      if (c.type === 'Button' && !c.properties.label) {
        warnings.push(`Accessibility: Component ${c.id} of type Button is missing a descriptive label.`);
      }
    });

    return {
      valid: warnings.length === 0,
      warnings
    };
  }
}
