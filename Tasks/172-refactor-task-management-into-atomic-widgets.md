# Task: Refactoring des Aufgaben-Moduls in atomare Widgets

**Ziel:** Zerlegung des monolithischen `SelfOrganisationPanel` in kleinere, wiederverwendbare "Widget"-Komponenten. Dies ist der erste Schritt, um das Aufgaben-Management in den neuen visuellen UI-Builder zu integrieren.

**Anforderungen:**
1.  **Atomisierung:** Das bestehende `SelfOrganisationPanel` soll in mindestens zwei separate Widget-Komponenten aufgeteilt werden:
    *   `TaskListWidget.tsx`: Eine Komponente, die nur die Tabelle mit den Aufgaben anzeigt und deren Löschung ermöglicht.
    *   `CreateTaskFormWidget.tsx`: Eine Komponente, die nur das Formular zur Erstellung einer neuen Aufgabe enthält.
2.  **Widget-Manifest:** Erstellung einer neuen Manifest-Datei `src/core/assets/ui-widget-manifest.json`.
3.  **Registrierung:** Die neuen Widget-Komponenten (`TaskListWidget`, `CreateTaskFormWidget`) müssen in diesem Manifest registriert werden, damit sie später von der `LibraryPanel` und dem `UIEditorPanel` erkannt werden können.
4.  **Aufräumen:** Das ursprüngliche `SelfOrganisationPanel.tsx` wird nach der Zerlegung nicht mehr benötigt und kann entfernt werden.