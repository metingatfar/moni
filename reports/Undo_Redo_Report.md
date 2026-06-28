# Undo Redo Report

* **Mechanics**: Manages editor action history using `UndoRedoManager`.
* **Stack Controllers**: Operates parallel `undoStack` and `redoStack` storing callback closures (`undoFn`, `redoFn`).
* **History Logs**: Exposes descriptive action naming logs to render inside VISUAL BUILDER CENTER sidebar panel.
