# Task: Implementierung des Fenster- und Popup-Systems

**ID:** 178
**Ziel:** Implementierung eines flexiblen Systems zur visuellen Erstellung und Verwaltung von drei verschiedenen Arten von Fenstern/Popups, die zur Laufzeit durch die Spiellogik ausgelöst werden können.

## Anforderungen

1.  **Drei neue Fenster-Typen (Widgets):**
    *   **a) Info-Popup (Tooltip):** Ein nicht-interaktives Widget, das bei einem Hover-Event an der Mauszeiger-Position erscheint. Es dient rein zur Anzeige von Informationen.
    *   **b) Modales Fenster (Dialog):** Ein klassisches, verschiebbares Fenster mit Titelzeile, Schließen-Button und einem Inhaltsbereich. Startposition und Größe sind im Editor definierbar.
    *   **c) Kontext-Popup (Popover):** Eine Mischung aus a) und b). Es erscheint an der Klick-Position des Mauszeigers, bleibt aber offen und verhält sich wie ein kleines, verschiebbares Fenster mit interaktivem Inhalt (z.B. Buttons).

2.  **Editor-Integration:**
    *   **Neuer Haupt-Tab "Windows":** Ein neuer Tab wird neben "Scene" und "UI Editor" eingeführt. Dieser Tab beherbergt den neuen `WindowEditorPanel`.
    *   **Tab-basierter Fenster-Editor:** Jedes erstellte Fenster (egal welchen Typs) öffnet einen eigenen Design-Tab innerhalb des `WindowEditorPanel`. Dies ermöglicht die gleichzeitige Bearbeitung mehrerer Fenster.
    *   **Isolierter Design-Canvas:** Jeder dieser internen Tabs enthält eine eigene, isolierte Design-Leinwand, auf der Benutzer Sektionen, Spalten und Widgets platzieren können, um den Inhalt des Fensters zu gestalten.

3.  **Styling & Inspector:**
    *   Die drei neuen Fenster-Typen werden im `ui-widget-manifest.json` als spezielle Widgets registriert.
    *   Wenn ein Fenster im "Windows"-Editor ausgewählt ist, zeigt der Inspector die "Rahmen"-Eigenschaften an (z.B. Startposition, Größe, Rahmenfarbe, Titelzeilen-Stil).
    *   Die *innerhalb* des Fensters platzierten Elemente (Sektionen, Spalten, Widgets) können einzeln ausgewählt werden, woraufhin der Inspector wie gewohnt deren spezifische Eigenschaften anzeigt. Dies stellt die vollständige, individuelle Designbarkeit sicher.

4.  **Logik-Graph-Integration:**
    *   Es müssen neue Nodes für den Logik-Graphen erstellt werden (z.B. "Show Window", "Hide Window"), um die Fenster zur Laufzeit dynamisch (z.B. als Reaktion auf einen Klick) anzuzeigen.

## Checkliste der atomaren Schritte

- [ ] **Schritt 1:** Implementierung des neuen Haupt-Tabs "Windows" und des leeren `WindowEditorPanel` mit seiner internen Tab-Struktur.
- [ ] **Schritt 2:** Ergänzung des `ui-widget-manifest.json` um die drei neuen Fenster-Typen und deren Anzeige in einer neuen "Windows"-Kategorie im `LibraryPanel`.
- [ ] **Schritt 3:** Implementierung der Logik, dass das Ziehen eines Fenster-Typs aus der Bibliothek einen neuen Tab im `WindowEditorPanel` erstellt, anstatt es auf den Canvas zu ziehen.
- [ ] **Schritt 4:** Implementierung des isolierten Design-Canvas innerhalb jedes Fenster-Editor-Tabs, sodass Sektionen und Widgets darin platziert werden können.
- [ ] **Schritt 5:** Implementierung des Renderings für das "Modale Fenster (Dialog)" im UI-Editor, inklusive Titelzeile und Schließen-Button.
- [ ] **Schritt 6:** Implementierung des Renderings für "Info-Popup" und "Kontext-Popup".
- [ ] **Schritt 7:** Anpassung des Inspectors, um die "Rahmen"-Eigenschaften des ausgewählten Fensters zu bearbeiten.
- [ ] **Schritt 8:** Implementierung der neuen Logik-Graph-Nodes zum Anzeigen und Verbergen der Fenster.