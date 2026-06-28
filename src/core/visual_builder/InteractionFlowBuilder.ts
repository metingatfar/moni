import type { BuilderScreen, ScreenInteraction } from './BuilderScreen';

export class InteractionFlowBuilder {
  public addNavigationFlow(
    sourceScreen: BuilderScreen,
    componentId: string,
    targetRoute: string,
    trigger: 'onClick' | 'onSubmit' = 'onClick'
  ): void {
    const interaction: ScreenInteraction = {
      triggerEvent: trigger,
      sourceComponentId: componentId,
      action: 'navigate',
      targetRoute
    };
    sourceScreen.interactions.push(interaction);
  }

  public addModalToggle(
    sourceScreen: BuilderScreen,
    componentId: string,
    targetModalId: string,
    action: 'openModal' | 'closeModal'
  ): void {
    const interaction: ScreenInteraction = {
      triggerEvent: 'onClick',
      sourceComponentId: componentId,
      action,
      targetComponentId: targetModalId
    };
    sourceScreen.interactions.push(interaction);
  }

  public setScreenStateFlow(
    screen: BuilderScreen,
    state: 'loading' | 'empty' | 'error' | 'success'
  ): void {
    screen.metadata.currentStateFlow = state;
  }
}
