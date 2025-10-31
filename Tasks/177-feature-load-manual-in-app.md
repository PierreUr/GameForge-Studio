# Task: Handbuch in In-App-Fenster laden

**ID:** 177 (Feature)
**Ziel:** Das Entwickler-Handbuch (`handbuch.html`) soll nicht nur als separate Datei existieren, sondern auch direkt in der Anwendung über einen Button in einem modalen Fenster angezeigt werden können.

## Anforderungen

1.  **UI-Button:**
    *   **Anforderung:** Ein neuer Button (z.B. mit der Beschriftung "Hilfe" oder einem "?-Icon") soll zur Haupt-Toolbar (`Toolbar.tsx`) hinzugefügt werden.

2.  **Modales Fenster:**
    *   **Anforderung:** Ein Klick auf den neuen Button soll ein modales Fenster (Overlay) öffnen, das den Inhalt des Handbuchs anzeigt.
    *   **Komponente:** Es soll eine generische, wiederverwendbare `Modal.tsx`-Komponente erstellt werden, die `isOpen`, `onClose` und `children`-Props akzeptiert.

3.  **Inhalts-Ladelogik:**
    *   **Anforderung:** Wenn das Modal geöffnet wird, soll der Inhalt der `handbuch.html`-Datei dynamisch mit `fetch` geladen werden.
    *   **Anzeige:** Der geladene HTML-Inhalt soll sicher im Modal gerendert werden (z.B. mit `dangerouslySetInnerHTML`), wobei das Styling des Handbuchs erhalten bleiben sollte.

## Checkliste der atomaren Schritte

- [ ] **Schritt 1:** Eine generische `Modal.tsx`-Komponente und einen "Hilfe"-Button in der `Toolbar.tsx` erstellen.
- [ ] **Schritt 2:** Die Logik zum Fetchen und Rendern der `handbuch.html` im Modal implementieren.
