import type { BuilderComponent } from './BuilderComponent';

export class PropertyInspector {
  public bindToken(
    comp: BuilderComponent,
    propertyKey: 'color' | 'background' | 'padding' | 'margin' | 'typography' | 'radius',
    tokenName: string
  ): void {
    comp.properties.boundTokens[propertyKey] = tokenName;
  }

  public updateProperties(
    comp: BuilderComponent,
    properties: { label?: string; placeholder?: string; src?: string; visibility?: boolean }
  ): void {
    if (properties.label !== undefined) comp.properties.label = properties.label;
    if (properties.placeholder !== undefined) comp.properties.placeholder = properties.placeholder;
    if (properties.src !== undefined) comp.properties.src = properties.src;
    if (properties.visibility !== undefined) comp.properties.visibility = properties.visibility;
  }

  public getBoundStyleCSS(comp: BuilderComponent): Record<string, string> {
    const css: Record<string, string> = {};
    const tokens = comp.properties.boundTokens;

    if (tokens.color) css['color'] = `var(--token-${tokens.color})`;
    if (tokens.background) css['background-color'] = `var(--token-${tokens.background})`;
    if (tokens.padding) css['padding'] = `var(--token-${tokens.padding})`;
    if (tokens.margin) css['margin'] = `var(--token-${tokens.margin})`;
    if (tokens.radius) css['border-radius'] = `var(--token-${tokens.radius})`;
    if (tokens.typography) css['font'] = `var(--token-${tokens.typography})`;

    return css;
  }
}
