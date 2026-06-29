# MONI UI 5.0 Responsive Breakpoints

Detailing how MONI handles desktop and mobile scaling:

## Breakpoint Mapping

- **Desktop (1440px+)**: Displays standard three-column view (Sidebar, Core Workspaces, Right tabbed diagnostics, Bottom dashboards).
- **Mobile (<768px)**: Toggles layout structure to MobileLayout. The main view displays single-column windows with simplified floating message composers.

## Layout Orchestration

When layout changes, views are re-evaluated to adjust padding buffers and shrink controls dynamically.
This prevents overlap issues on small devices.
