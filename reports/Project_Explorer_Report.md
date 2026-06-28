# Project Explorer Report

* **Feature/Subsystem**: Folder Explorer & Virtual Project Models
* **Redesign Phase**: Phase 2 (AI Workspace & Operating System Experience)
* **Status**: IMPLEMENTED 🟢

---

## 1. Project Scopes & Listings
Projects are represented as top-level container structures. The workspace pre-bundles a set of 7 enterprise projects:
1. **MONI**: The core assistant repository template.
2. **FitHayat**: Health-monitoring mobile application template.
3. **Enterprise CRM**: Corporate resource manager client.
4. **Website**: Static promotional frontend.
5. **Mobile App**: Cross-platform Flutter setup.
6. **API**: Backend FastAPI service folder.
7. **AI Agent**: Custom autonomous agent setup.

---

## 2. Directory Tree Structures
Each project displays virtual file trees:
- `📁 src`: Hosts `.tsx` and `.css` source files.
- `📁 workflows`: Houses JSON-based custom flow diagrams.
- `📁 reports`: Houses markdown documents.
- `📁 knowledge`: Houses checklist JSONs.

Selecting any directory or node expands/collapses the tree, and selecting any document opens a tab in the center workspace.

---

## 3. Filesystem Binding Compatibility
The project tree schema supports key-value mapping of file URIs (`file:///`). Folder state handles virtual paths that map to standard workspace locations (like `c:\Users\user\Desktop\moni`), preparing the explorer for direct native file read/write bindings in next phases.
