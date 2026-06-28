# MONI 2.0 Desktop OS Layout Redesign Report

## 1. Layout Specification
The desktop view replaces the mobile mockup with a premium multi-pane workspace:
* **Sticky Glass Header:** Sticky at the top, includes logo, command search bar, new chat buttons, language switchers, and status controls.
* **Collapsible Left Sidebar:** Dynamic toggle width between `260px` and `64px`. Displays full visual navigation tabs and the animated Mini Orb.
* **Main Center Workspace:** Centered view area with maximum width constraint of `900px` for optimal readability and conversation pacing.
* **Right Utility Sidebar:** Tabbed panels for Assistant, Memory categories list, Thinking status, Voice configurations, and Diagnostics.
* **Status Bar:** Thin `24px` bar at the bottom containing live details about SQLite, provider connection, and voice feedback.

## 2. Command Palette Integration
Pressing `Ctrl + P` or clicking the command search triggers the cosmic modal. It filters navigation commands using fuzzy text input.
