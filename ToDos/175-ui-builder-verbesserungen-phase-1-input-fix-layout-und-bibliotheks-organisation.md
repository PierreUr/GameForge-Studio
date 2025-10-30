# Task: UI-Builder-Verbesserungen (Phase 1)

**ID:** 175
**Ziel:** Verbesserung der Benutzerfreundlichkeit (Usability) und Organisation des UI-Builders durch Behebung kritischer Interaktionsprobleme und Strukturierung der Komponentenbibliothek.

## Anforderungen

1.  **Behebung des Fokusverlusts im Inspector:**
    *   **Problem:** Text- und Zahlen-Inputs im `WidgetInspector` verlieren nach jeder einzelnen Eingabe den Fokus. Dies macht die Bearbeitung von Werten extrem umständlich.
    *   **Lösung:** Die Weitergabe von `onChange`-Handlern und die Zustandsverwaltung müssen so refaktorisiert werden, dass die Input-Komponenten nicht bei jeder Eingabe unnötigerweise neu gerendert werden. Der Zustand des UI-Layouts muss auf der obersten Ebene (`App.tsx`) gehalten und effizient aktualisiert werden.

2.  **Kategorisierung im LibraryPanel:**
    *   **Problem:** Alle UI-Widgets und Layout-Elemente werden in einer langen, unsortierten Liste in der Bibliothek angezeigt.
    *   **Lösung:** Die `LibraryPanel`-Komponente soll die Widgets basierend auf dem `category`-Feld aus dem `ui-widget-manifest.json` gruppieren. Jede Kategorie (z.B. "Layout", "Content", "Forms") soll eine eigene Überschrift und einen eigenen visuellen Abschnitt erhalten.

3.  **Löschen von Widgets:**
    *   **Problem:** Es gibt keine Möglichkeit, ein einmal platziertes Widget von der Leinwand zu entfernen.
    *   **Lösung:** Dem `WidgetInspector` soll ein "Delete Widget"-Button hinzugefügt werden. Bei Klick wird das aktuell ausgewählte Widget aus der Layout-Struktur entfernt.

## Checkliste der atomaren Schritte

-   [ ] **Schritt 1:** Implementierung des Fokus-Fixes für Inspector-Inputs.
-   [ ] **Schritt 2:** Implementierung der Widget-Gruppierung nach Kategorien in der `LibraryPanel`.
-   [ ] **Schritt 3:** Implementierung der Funktionalität zum Löschen von Widgets über den Inspector.
