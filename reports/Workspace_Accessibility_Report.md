# MONI Workspace Accessibility & Ergonomics Report

This report documents the keyboard productivity, navigation shortcut mappings, high-contrast visual focus states, and tab-ordering layouts integrated into MONI Workspace X.

## 1. Mapped Keyboard Shortcuts Catalog

To ensure the workspace can be fully navigated using keyboard shortcuts alone, the following hotkeys have been bound:

| Keyboard Shortcut | Action Description | Focus Element Target |
| :--- | :--- | :--- |
| `Ctrl + B` | Toggle Sol Gezgini | Left Sidebar Explorer visibility toggle |
| `Ctrl + J` | Toggle Konsol Paneli | Bottom Developer Panel visibility toggle |
| `Ctrl + \\` | Split Editor Layout | Toggles Split view for active editor tab |
| `Alt + 1` | Focus Workspace Explorer | Opens/selects workspace file tree |
| `Alt + 3` | Focus AI Copilot Chat | Opens/selects right assistant panel |
| `Ctrl + Shift + E` | Open Files Explorer | Switches Left Explorer section to workspace |
| `Ctrl + Shift + G` | Open git bottom tab | Switches bottom console section to Git |
| `Ctrl + Shift + M` | Open compiler problems | Switches bottom console section to Problems |
| `Ctrl + Shift + R` | Open reports tab | Opens the Reports Viewer panel |
| `Ctrl + Shift + P` | Command Palette | Opens floating command query dialog |
| `Ctrl + P` | Quick Open File | Opens fuzzy file navigator |

---

## 2. Interactive Focus States & High Contrast Colors

- **Focus Outlines**: Active input elements (such as search boxes inside Command Palette or Quick Open) feature explicit border wraps.
- **Glass Panel Contrast**: Color definitions utilize deep dark obsidian backdrops (`#06070a`) and light slate text colors (`#e2e8f0`) to satisfy accessibility contrast standards.
- **Micro-Animations**: Uses brief CSS transitions for hover items to give immediate visual feedback.
