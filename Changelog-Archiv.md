# Changelog Archiv - GameForge Studio

---
**Task:** 175-ui-builder-verbesserungen-phase-1-input-fix-layout-und-bibliotheks-organisation
**Schwierigkeit:** Mittel
**Lösung:** Der Fokusverlust wurde durch die Einführung eines lokalen Zustands im `WidgetInspector` behoben. Die `LibraryPanel` wurde refaktorisiert, um eine einheitliche, nach Kategorien gruppierte Liste aller Elemente anzuzeigen, was die Übersichtlichkeit verbessert. Ein "Delete"-Button wurde hinzugefügt, der ein Event auslöst, das in der Hauptanwendung behandelt wird, um Widgets zu entfernen.

## [1.25.0]
- **[TASK-175]** [FEAT] Implemented several usability improvements for the UI Builder. The widget library is now grouped by categories. A "Delete Widget" button was added to the inspector.
- **[TASK-175]** [FIX] Fixed a critical bug where input fields in the Widget Inspector would lose focus after every keystroke, making editing properties nearly impossible.

---
**Task:** 174-implement-ui-builder-phase-2-widget-library-and-inspector
**Schwierigkeit:** Hoch
**Lösung:** Implementierung eines Systems zur Widget-Selektion und dynamischen Anzeige von Eigenschaften im Inspector. Der `RightSidebar` wurde erweitert, um auf ein `ui-widget:selected`-Event zu hören, das vom `UIEditorPanel` ausgelöst wird. Für die Interaktion mit dem Canvas wurden Zoom- (STRG+Mausrad) und Pan-Funktionen (mittlere Maustaste) hinzugefügt, um die Navigation im Editor zu erleichtern.

## [1.24.0]
- **[TASK-174]** [FEAT] Implemented Phase 2 of the UI Builder. Widgets dropped on the canvas can now be selected. The Inspector panel (right sidebar) dynamically displays editable properties for the selected widget. Implemented zoom (CTRL+Mousewheel) and pan (Middle Mouse Button) functionality in the UI Editor.
