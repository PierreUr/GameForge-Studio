# Task: Implementierung eines visuellen UI-Page-Builders

**Ziel:** Implementierung eines visuellen, Drag-and-Drop-basierten UI-Page-Builders, der es ermöglicht, Benutzeroberflächen durch das Anordnen von Basiskomponenten auf einer Leinwand zu erstellen, ähnlich wie in dem vom Benutzer bereitgestellten Screenshot.

**Anforderungen:**
1.  **UI-Komponentenbibliothek:** Die `LibraryPanel`-Komponente muss erweitert werden, um eine Liste von grundlegenden, atomaren UI-Komponenten (Widgets) wie "Überschrift", "Button", "Bild", "Abstandhalter" und "Sektion" anzuzeigen. Hierfür wird ein neues Manifest (`ui-widget-manifest.json`) benötigt.
2.  **Canvas als Drop-Zone:** Der zentrale Arbeitsbereich (Canvas) muss als Drop-Zone für diese UI-Widgets fungieren. Das Ablegen eines Widgets soll es zur Layout-Struktur der Seite hinzufügen.
3.  **Layout-System:** Implementierung eines hierarchischen Layout-Systems, das auf Sektionen und Spalten basiert. Benutzer müssen in der Lage sein, neue Sektionen hinzuzufügen und deren Spaltenlayout zu definieren (z. B. 1 Spalte, 2 Spalten, etc.).
4.  **Komponenten-Rendering:** Die auf der Leinwand platzierten Widgets müssen als echte React-Komponenten gerendert werden, um eine Live-Vorschau der erstellten UI zu ermöglichen.
5.  **Inspector-Integration:** Wenn ein Widget auf der Leinwand ausgewählt wird, soll der `RightSidebar` (Inspector) dessen editierbare Eigenschaften (z.B. Text für eine Überschrift, Farbe für einen Button) anzeigen und deren Bearbeitung ermöglichen.
6.  **Serialisierung:** Die gesamte Seitenstruktur (Layout, Widgets und deren Eigenschaften) muss in ein JSON-Format serialisiert und gespeichert werden können, um das Laden und Speichern von erstellten Seiten zu ermöglichen.