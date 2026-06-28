export interface WireframePackage {
  fidelity: 'low' | 'medium' | 'high';
  asciiDraft: string;
  structuralPlan: string;
}

export class WireframeGenerator {
  public generateWireframes(screenName: string, platform: string): WireframePackage[] {
    const isMobile = platform === 'mobile' || platform === 'foldable';
    
    // Low fidelity ASCII layout
    const lowFiAscii = isMobile ? `
+-----------------------+
| [=]   APP BRAND   [o] |
+-----------------------+
| [ Search...         ] |
+-----------------------+
|                       |
|   +---------------+   |
|   |  Hero Card    |   |
|   +---------------+   |
|                       |
|   +---------------+   |
|   |  List Item 1  |   |
|   |  List Item 2  |   |
|   +---------------+   |
|                       |
+-----------------------+
| [H]  [S]  [N]  [P]    |
+-----------------------+
` : `
+-------------------------------------------------+
| [=] APP BRAND             [ Search... ]     [o] |
+---------------+---------------------------------+
| Sidebar       | Header Widget                   |
|               +---------------------------------+
| [Home]        |                                 |
| [Analytics]   |   +---------------+  +-------+  |
| [Settings]    |   | Primary Card  |  | Alert |  |
|               |   +---------------+  +-------+  |
|               |                                 |
+---------------+---------------------------------+
`;

    // Medium Fidelity Layout Skeletons
    const medFiPlan = `
Screen: ${screenName} (${platform})
1. RootLayout (Flex ${isMobile ? 'column' : 'row'})
   - TopHeader (Fixed, 64px height)
     * Flex Container (justify-between)
       - LogoPlaceholder
       - ProfileBadge
   - MainBody Container (Flex row)
     ${!isMobile ? '- LeftSidebar (240px width, vertical nav links)' : ''}
     - ContentGrid (Adaptive columns)
       * Card Component 1 (Primary Stat, flex column)
       * Card Component 2 (Detailed Chart, width 100%)
`;

    // High Fidelity Specifications
    const highFiPlan = `
HTML/CSS Hierarchy:
<div class="moni-app-root ${isMobile ? 'mobile' : 'desktop'}">
  <header class="moni-header" style="height:64px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border);">
    <div class="logo">BrandLogo</div>
    <div class="search-bar"><input type="search" placeholder="Search..."/></div>
    <div class="avatar">AvatarImg</div>
  </header>
  <main class="moni-main" style="display:flex;">
    ${!isMobile ? `<aside class="moni-sidebar" style="width:240px; display:flex; flex-direction:column; padding:16px;">...</aside>` : ''}
    <section class="moni-content-grid" style="flex:1; display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px; padding:24px;">
      <article class="moni-card" style="border-radius:8px; padding:16px; background:var(--surface); border:1px solid var(--border);">
        <h3>Primary Metric</h3>
        <p>Values & Trends</p>
      </article>
    </section>
  </main>
</div>
`;

    return [
      { fidelity: 'low', asciiDraft: lowFiAscii, structuralPlan: 'Simple raw ascii wireframe preview.' },
      { fidelity: 'medium', asciiDraft: lowFiAscii, structuralPlan: medFiPlan },
      { fidelity: 'high', asciiDraft: lowFiAscii, structuralPlan: highFiPlan }
    ];
  }
}
