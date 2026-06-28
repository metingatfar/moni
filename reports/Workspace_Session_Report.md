# MONI Workspace Session Manager Report

This report documents the local storage state persistence rules and auto-restoring behaviors implemented in the Session Manager of MONI Workspace X.

## 1. Saved State Persistence Catalog

The session auto-saves state configurations inside browser `localStorage` on change:

| State Variable | Storage Key | Restoration Behavior |
| :--- | :--- | :--- |
| **Opened Tabs List** | `moni_open_tabs` | Deserialized on mount; loads tab titles, file paths, readOnly status, and content buffers. |
| **Active Tab ID** | `moni_active_tab_id` | Selects and highlights active tab on load. |
| **Explorer Folders Expanded** | `moni_expanded_explorer_folders` | Restores directory nodes expansion flags in the Project Explorer file tree. |
| **Left Sidebar Width** | `moni_left_sidebar_width` | Restores left sidebar width (clamped between 180px and 450px). |
| **Right Sidebar Width** | `moni_right_sidebar_width` | Restores right sidebar width (clamped between 220px and 500px). |
| **Bottom Panel Height** | `moni_bottom_panel_height` | Restores bottom panel height (clamped between 120px and 550px). |
| **Panel Expansion Toggles** | `moni_is_left_expanded` / `moni_is_right_expanded` | Restores collapsed/expanded state. |
| **Active Preset** | `moni_active_workspace_preset` | Restores the selected layout preset model. |
| **Favorites & Recents** | `moni_favorite_files` / `moni_recent_files` | Restores user quick file links. |

---

## 2. Session Recovery Lifecycle

On component mount, state initializers retrieve value entries from local client storage.
The visual interface instantly resumes where the developer left it, eliminating workspace setup overhead on refresh or browser restart.
