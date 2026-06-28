export interface PaletteComponent {
  tag: string;
  category: 'Input' | 'Display' | 'Navigation' | 'Feedback' | 'Surfaces' | 'AI';
  defaultWidth: number;
  defaultHeight: number;
}

export class ComponentPalette {
  private components: PaletteComponent[] = [
    { tag: 'Button', category: 'Input', defaultWidth: 120, defaultHeight: 40 },
    { tag: 'TextInput', category: 'Input', defaultWidth: 280, defaultHeight: 48 },
    { tag: 'Card', category: 'Surfaces', defaultWidth: 320, defaultHeight: 200 },
    { tag: 'Sidebar', category: 'Navigation', defaultWidth: 240, defaultHeight: 800 },
    { tag: 'LineChart', category: 'Display', defaultWidth: 600, defaultHeight: 300 },
    { tag: 'Table', category: 'Display', defaultWidth: 800, defaultHeight: 400 },
    { tag: 'Dialog', category: 'Feedback', defaultWidth: 500, defaultHeight: 300 },
    { tag: 'VoiceWidget', category: 'AI', defaultWidth: 64, defaultHeight: 64 }
  ];

  public getComponents(): PaletteComponent[] {
    return this.components;
  }

  public getByCategory(category: PaletteComponent['category']): PaletteComponent[] {
    return this.components.filter(c => c.category === category);
  }
}
