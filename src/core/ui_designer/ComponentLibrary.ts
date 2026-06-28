export interface LibraryComponent {
  tag: string;
  category: 'Input' | 'Display' | 'Navigation' | 'Feedback' | 'Surfaces';
  recommendedLibrary: string;
  props: string[];
}

export class ComponentLibrary {
  private libraryList = ['Material Design', 'Shadcn/UI', 'Tailwind UI', 'Fluent UI', 'Cupertino', 'Bootstrap', 'Custom Components'];

  public getSupportedLibraries(): string[] {
    return this.libraryList;
  }

  public resolveComponents(libraries: string[]): LibraryComponent[] {
    const selected = libraries.length > 0 ? libraries[0] : 'Shadcn/UI';
    
    return [
      {
        tag: 'Button',
        category: 'Input',
        recommendedLibrary: selected,
        props: ['variant', 'size', 'onClick', 'disabled', 'icon']
      },
      {
        tag: 'Card',
        category: 'Surfaces',
        recommendedLibrary: selected,
        props: ['title', 'description', 'elevation', 'headerAction']
      },
      {
        tag: 'TextInput',
        category: 'Input',
        recommendedLibrary: selected,
        props: ['value', 'placeholder', 'onChange', 'error', 'label']
      },
      {
        tag: 'SideNavigation',
        category: 'Navigation',
        recommendedLibrary: selected,
        props: ['items', 'activeIndex', 'onSelect', 'collapsed']
      },
      {
        tag: 'Toast',
        category: 'Feedback',
        recommendedLibrary: selected,
        props: ['message', 'type', 'duration', 'onClose']
      }
    ];
  }
}
