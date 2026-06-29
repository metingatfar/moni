# MONI UI 5.0 Master Architecture

This document outlines the design and files structure of the rebuilt MONI 5.0 Presentation Layer, following modular principles.

## Structure Overview

The entire presentation logic is decoupled from layouts, components, and views using dedicated React Providers to act as a state-driven pipeline:

```
AppShell
  ↓
ThemeProvider & LayoutProvider & WorkspaceProvider & ChatProvider
  ↓
DesktopLayout or MobileLayout
  ↓
HomeView / ChatView / TasksView
  ↓
GlassCard / Orb / Avatar Components
```

## Key Files Created

1. **Providers**:
   - `providers/ThemeProvider.tsx`: Wraps user dark-mode states and accessibility overrides.
   - `providers/LayoutProvider.tsx`: Handles breakpoints and sidebar dimensions.
   - `providers/WorkspaceProvider.tsx`: Feeds todo/notes/reminders state.
   - `providers/ChatProvider.tsx`: Holds message flows, active providers, and TTS settings.

2. **Components**:
   - `components/GlassComponents.tsx`: Standard UI elements styled with MDL templates.
   - `components/Orb.tsx`: Fully animated visualizer representing client state (Listening, Thinking, Speaking).
   - `components/ChatComponents.tsx`: Formatted message bubbles and bubble toolbar overlays.
