# MONI Workspace Presets Configuration Report

This report outlines the layout preset modes, dynamic panel coordinates, and layout modes available inside MONI Workspace X.

## 1. Preset Modes Specifications

Selecting a preset mode automatically rearranges the active panels to optimize focus and productivity:

| Preset Mode | Left Sidebar (Explorer) | Right Sidebar (AI Copilot) | Bottom Developer Panel | Active Default Tab |
| :--- | :--- | :--- | :--- | :--- |
| **Executive** | Collapsed | Expanded | Collapsed | Home Dashboard |
| **Developer** | Expanded | Collapsed | Expanded | Monaco Code Editor |
| **Designer** | Collapsed | Collapsed | Collapsed | Visual Designer |
| **AI Engineer** | Collapsed | Expanded | Expanded | AI Assistant Chat |
| **Research** | Collapsed | Collapsed | Collapsed | Reports Viewer |

---

## 2. Preset Transition Logic

- **Pure Layout Restructuring**: Transitioning between preset configurations only modifies panel visibility boolean states (`isLeftExpanded`, `isRightExpanded`, `isBottomExpanded`).
- **Ergonomics**: Minimizes window clutter during focused tasks (e.g. debugging vs reading reports).
- **Session Support**: The active preset is stored in `localStorage` and is recovered automatically on reload.
