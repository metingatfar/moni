# MONI UI 5.0 Performance Report

Details on performance optimization of the new interface layers:

## Strategy

1. **Decoupled Providers**:
   - Isolating local workspace states from chat streams ensures heavy LLM token outputs do not cause side panel re-renders.

2. **Component Splitting**:
   - Large structures like `DesktopViews` are split into compact views (`HomeView`, `ChatView`) compiled on-demand.

3. **Asset Handling**:
   - Avoids referencing heavy external imagery; all icons are generated using lightweight Unicode vector glyphs.
