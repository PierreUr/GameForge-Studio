# Task: Implementierung des UI-Builders (Phase 2: Widget-Bibliothek & Inspector)

**Ziel:** Integration der atomaren UI-Widgets in die `LibraryPanel` und Anbindung des `Inspector`-Panels zur Bearbeitung der Widget-Eigenschaften.

**Anforderungen:**
1.  **Widget-Bibliothek:** Die `LibraryPanel` muss das neue `ui-widget-manifest.json` lesen und die darin definierten Widgets (z.B. "TaskList", "CreateTaskForm") als ziehbare Karten anzeigen.
2.  **Widget-Rendering:** Die in `Task 173` erstellten `Column`-Komponenten müssen die gedroppten Widgets korrekt rendern. Der `UIEditorPanel` benötigt eine zentrale Mapping-Logik, die Widget-Typen (aus dem Manifest) zu den entsprechenden React-Komponenten auflöst.
3.  **Widget-Selektion:** Implementiere eine Klick-Logik im `UIEditorPanel`. Ein Klick auf ein gerendertes Widget auf der Leinwand soll dieses als "ausgewählt" markieren.
4.  **Inspector-Anbindung:** Die `RightSidebar` (Inspector) muss auf das Auswahl-Event reagieren. Sie soll die Eigenschaften des ausgewählten Widgets anzeigen, basierend auf den im Manifest definierten `properties`.
5.  **Dynamische Updates:** Änderungen im Inspector müssen über ein Command-Pattern (z.B. `UpdateWidgetPropertyCommand`) an das `UIEditorPanel` zurückgemeldet werden, um das ausgewählte Widget mit den neuen Eigenschaften neu zu rendern.