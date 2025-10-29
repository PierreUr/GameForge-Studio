# Task: Implementierung des UI-Builders (Phase 1: Layout-System)

**Ziel:** Schaffung eines strukturierten, hierarchischen Layout-Systems als Grundlage für den visuellen UI-Builder. Dies ersetzt die aktuelle, auf absoluter Positionierung basierende Implementierung im `UIEditorPanel`.

**Anforderungen:**
1.  **Layout-Komponenten:** Erstellung von grundlegenden Layout-Komponenten:
    *   `Section.tsx`: Ein Container, der eine oder mehrere Spalten aufnehmen kann.
    *   `Column.tsx`: Ein Container, der als Drop-Zone für UI-Widgets dient.
2.  **Layout-Bibliothek:** Die `Section`-Komponente muss in die `LibraryPanel` (über das `ui-widget-manifest.json`) aufgenommen werden, damit Benutzer neue Sektionen auf die Leinwand ziehen können.
3.  **Hierarchisches Dropping:** Die Drag-and-Drop-Logik im `UIEditorPanel` muss überarbeitet werden:
    *   Nur `Section`-Komponenten können direkt auf die leere Leinwand gezogen werden.
    *   Innerhalb einer `Section` können Benutzer das Spaltenlayout wählen (z.B. über ein Kontextmenü oder im Inspector).
    *   Widgets (wie `TaskListWidget`) können nur noch in `Column`-Komponenten gezogen werden. Sie sollen sich dort vertikal anordnen ("einschnappen") und nicht mehr absolut positioniert werden.
4.  **Datenstruktur:** Die Datenstruktur, die das Seitenlayout repräsentiert, muss diese Hierarchie (Seite -> Sektionen -> Spalten -> Widgets) abbilden.