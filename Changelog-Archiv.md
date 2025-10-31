# Changelog Archiv - GameForge Studio

---
**Task:** 177-ui-builder-bugfixes-drag-and-drop
**Schwierigkeit:** Hoch
**Lösung:** Die Drag-and-Drop-Event-Handler wurden überarbeitet. Speziell wurde die Event-Propagation in der `Section`-Komponente korrigiert, sodass Widget-Drag-Events nicht mehr fälschlicherweise konsumiert werden. Die `Column`-Komponente berechnet nun den `dropIndex` präziser, um das korrekte Einfügen neuer und verschobener Widgets zu ermöglichen. Zusätzlich wurde eine "Add Widget"-Funktion mit einem "+"-Button und einem `WidgetPicker`-Popup implementiert, um das Hinzufügen von Widgets per Klick zu vereinfachen.

## [1.26.0]
- **[TASK-177]** [FEAT] Added a new "Add Widget" button (+) to the bottom of each column, allowing users to quickly add widgets from a searchable popup menu.
- **[TASK-177]** [FIX] Fixed a critical bug preventing widgets from being dragged and dropped into layout columns. The drop position indicator now works correctly for both new and existing widgets.

---
**Task:** 176-ui-builder-reordering-von-layout-sektionen-per-drag-and-drop
**Schwierigkeit:** Mittel
**Lösung:** Ein Drag-Handle wurde zu jeder Sektion hinzugefügt. Die `Section`-Komponente wurde um Drag-and-Drop-Event-Handler erweitert, die einen benutzerdefinierten Datentyp verwenden, um Sektions-Zieh-Vorgänge zu identifizieren. Ein visueller Indikator (blaue Linie) zeigt die Einfügeposition an. Die Logik im `UIEditorPanel` ordnet das Layout-Array basierend auf der Quell- und Ziel-ID neu an.

## [1.26.0]
- **[TASK-176]** [FEAT] Implemented drag-and-drop reordering for layout sections in the UI Editor. Sections can now be intuitively rearranged by dragging a handle, with a visual indicator showing the drop position.
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
- **[TASK-174]** [FEAT] Implemented Phase 2 of the UI Builder. Widgets dropped on the canvas can now be selected. The Inspector panel (right sidebar) dynamically displays editable properties for the selected widget. Implemented zoom (CTRL+Mousewheel) and pan (Middle Mouse Button) in the UI Editor.
