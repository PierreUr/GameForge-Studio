# Task: Implementierung von Inspector-Hilfe-Tooltips für alle Komponenten

**ID:** 178
**Ziel:** Verbesserung der Benutzerfreundlichkeit des Inspectors durch die Implementierung von kontextsensitiven Hilfe-Tooltips für alle einstellbaren Eigenschaften in allen Inspector-Komponenten.

## Anforderungen

1.  **Datenquelle:** Die Beschreibungstexte für jede Eigenschaft sollen aus den entsprechenden Manifest-Dateien (`ui-widget-manifest.json`) oder direkt in der Komponente (für `SectionInspector` und `ColumnInspector`) bezogen werden.
2.  **Tooltip-Komponente:** Die bereits erstellte `InspectorHelpTooltip.tsx` Komponente soll für alle Eigenschaften wiederverwendet werden.
3.  **Globale Steuerung:** Die Sichtbarkeit der Tooltips muss weiterhin über den globalen Schalter in der `RightSidebar` gesteuert werden. Alle Inspector-Komponenten müssen den `isHelpVisible`-Status korrekt empfangen und anwenden.
4.  **Umfassende Implementierung:** Die Hilfe-Tooltips müssen für die folgenden Inspector-Komponenten und alle ihre Eigenschaften implementiert werden:
    *   `SectionInspector.tsx` (Column Gap, Padding, Margin)
    *   `ColumnInspector.tsx` (Background Color, Padding)
    *   Alle Widgets, die im `ui-widget-manifest.json` definiert sind (z.B. Image, Spacer, Task List, etc.), indem die `description`-Felder im Manifest hinzugefügt werden.

## Checkliste der atomaren Schritte

-   [ ] **Schritt 1:** Hinzufügen von Hilfe-Tooltips zu allen Eigenschaften im `SectionInspector`.
-   [ ] **Schritt 2:** Hinzufügen von Hilfe-Tooltips zu allen Eigenschaften im `ColumnInspector`.
-   [ ] **Schritt 3:** Ergänzen der `ui-widget-manifest.json` um `description`-Felder für die Eigenschaften des "Image"-Widgets und Überprüfung der korrekten Anzeige.
-   [ ] **Schritt 4:** Ergänzen der `ui-widget-manifest.json` um `description`-Felder für alle verbleibenden Widgets.