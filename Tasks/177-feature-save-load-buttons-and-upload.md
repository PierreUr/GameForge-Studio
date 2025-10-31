# Task: Neue Speicher-Buttons und Upload-Funktionalität

**ID:** 177 (Feature)
**Ziel:** Verbesserung der Usability beim Speichern und Laden von Projekten durch Hinzufügen von dedizierten UI-Elementen und Dokumentation des Ladevorgangs.

## Anforderungen

1.  **Speicher-Icons:**
    *   **Anforderung:** Es sollen zwei neue Speicher-Icons (Disketten-Symbol) hinzugefügt werden, um die "Save Project As..."-Funktionalität schnell erreichbar zu machen.
    *   **Position 1:** In der Haupt-Toolbar, direkt neben den Undo/Redo-Buttons.
    *   **Position 2:** In der Toolbar über der Canvas, neben den "Device"-Steuerelementen.
    *   **Funktionalität:** Ein Klick auf eines der Icons soll denselben "Save Project As..."-Dialog wie der Menüpunkt im "Datei"-Menü auslösen.

2.  **Upload-Funktionalität:**
    *   **Anforderung:** Die bestehende "Load Project"-Funktion im "Datei"-Menü soll als primäre Methode zum Hochladen eines Designs beibehalten werden.

3.  **Handbuch-Dokumentation:**
    *   **Anforderung:** Es soll eine genaue Beschreibung im `handbuch.html` hinzugefügt werden, die das JSON-Format einer Projektdatei detailliert beschreibt. Dies ist entscheidend, damit Administratoren verstehen, wie die Dateien strukturiert sind und wie sie manuell angepasst oder validiert werden können.
    *   **Inhalt:** Die Dokumentation soll die Hierarchie (Layouts, Sektionen, Spalten, Widgets) und die wichtigsten Eigenschaften erläutern und ein Code-Beispiel enthalten.

## Checkliste der atomaren Schritte

- [ ] **Schritt 1:** Implementierung der beiden neuen Speicher-Icons in `Toolbar.tsx` und `ViewportControls.tsx`.
- [ ] **Schritt 2:** Sicherstellen, dass die `onLoad`-Funktionalität im `Toolbar.tsx` korrekt implementiert ist.
- [ ] **Schritt 3:** Erstellen eines neuen Abschnitts in `handbuch.html`, der die Projekt-JSON-Struktur beschreibt.