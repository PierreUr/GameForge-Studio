# GameForge Studio - Entwicklungsplan

**Projekt:** GameForge Studio  
**Version:** 1.20.0  
**Gesamtanzahl Tasks:** 160
**Status:** In Entwicklung

## Arbeitsschritte

- [x] **[SYSTEM]** **Task 177:** UI-Builder Bugfixes & Layout-Verbesserungen
    - [x] **BUG:** Drag & Drop für Sektionen ist fehlerhaft.
    - [x] **BUG:** Drag & Drop für Widgets innerhalb von Spalten ist instabil, führt zu Abstürzen und verhindert das Stapeln von >2 Elementen.
    - [x] **BUG:** Vertikales Scrollen im UI-Editor Canvas ist nicht möglich.
    - [x] **BUG:** Das Löschen von Widgets (über Inspector 'X' und Rechtsklick-Menü) funktioniert nicht.
    - [x] **BUG:** Das Hinzufügen einer neuen Sektion ist nur am Anfang des Layouts möglich, nicht mehr zwischen oder nach bestehenden Sektionen.
    - [x] **BUG:** Im `LibraryPanel` erscheint ein doppelter Scrollbalken, wenn Kategorien aufgeklappt werden.
    - [x] **BUG:** Die Spalten-Einstellungen (Anzahl, etc.) für verschachtelte Sektionen können im Inspector nicht geändert werden.
    - [x] **BUG:** Verschachtelte Sektionen haben einen unerwünschten vertikalen Abstand, obwohl alle Margin/Padding-Werte auf 0 gesetzt sind.
    - [x] **BUG:** Der Rahmen von Image-Widgets wird hinter dem Bild gerendert und border-radius nicht angewendet.
    - [x] **BUG:** Der "+ Add Widget"-Button fehlt in leeren Spalten.
    - [x] **FEATURE:** Abstand zwischen Spalten in einer Sektion ist nicht einstellbar.
    - [x] **FEATURE:** es soll sich soverhalten wie ein Websiten Designer kein Abstand zum rand usw. es gibt ohne ihn eingesstellt zu haben der Rahmen z.B. eines Section soll sehr schmall sien um 0 PX zum randhaben
    - [x] **FEATURE:** Die Modies für Table / Mobile / Desktop sollen je weil als eigenes design gespeichert werden können der Switch sollen oben link als overlay im Bearbeitungscanvas sei
    - [x] **[FEATURE]** Neue Speicher-Buttons (Disketten-Icons) und "Save As..."-Funktionalität implementieren.
    - [x] **[FEATURE]** Upload/Laden von Projekt-Designs ermöglichen.
    - [x] **[FEATURE]** Verschachtelte Sektionen (Sektion in Sektion) ermöglichen.
    - [x] **[DOC]** Projekt-Datei-Format im Handbuch dokumentieren.
- [ ] **[SYSTEM]** **Task 178:** Implementierung des Fenster- und Popup-Systems
    - [ ] **BUG:** Sektionen ignorieren `height`-Einstellungen, wenn sie bild-basierte Widgets enthalten.
        -   *Prompt-Referenz: Korrigiere das CSS-Flexbox-Verhalten in `Section.tsx` und `Column.tsx`, um sicherzustellen, dass Höhenbeschränkungen (insb. `maxHeight`) korrekt auf die Kind-Elemente vererbt und von diesen respektiert werden, auch wenn deren Inhalt (z.B. Bilder) überdimensioniert ist.*
    - [ ] **BUG:** Das Löschen von Widgets funktioniert nicht zuverlässig.
        -   *Prompt-Referenz: Analysiere und bereinige die Event-Handler für `ui-widget:delete` in `index.tsx` und `WindowEditorPanel.tsx`. Stelle sicher, dass es keine Konflikte gibt und das Event im korrekten Kontext (UI Editor vs. Window Editor) verarbeitet wird.*
    - [ ] **BUG:** Die `object-fit`-Eigenschaft für Image-Widgets hat keine Funktion.
        -   *Prompt-Referenz: Passe das Styling in `ImageWidget.tsx` und dem umschließenden Wrapper in `Column.tsx` an. Der Bild-Container muss eine explizite Höhe haben (z.B. durch `height: 100%`), damit `object-fit` wirksam werden kann. Stelle sicher, dass die übergeordnete Sektion die Höhe korrekt vorgibt.*
- [ ] **[ASSET]** **Task 019:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Frontend UI: Aufgabenverwaltung (Erweitert)
- [ ] **[ASSET]** **Task 020:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Produktivitätsmethoden (Backend)
- [ ] **[ASSET]** **Task 021:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Frontend UI: Methoden & Tools
- [ ] **[ASSET]** **Task 022:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Aufgabenerstellung (Natürl. Sprache, E-Mail)
- [ ] **[ASSET]** **Task 023:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Erinnerungen
- [ ] **[ASSET]** **Task 024:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   API für Aufgabenansichten
- [ ] **[ASSET]** **Task 025:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Frontend: Listen- & Tabellenansicht
- [ ] **[ASSET]** **Task 026:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Frontend: Board-Ansicht (Kanban)
- [ ] **[ASSET]** **Task 027:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Frontend: Kalender-Ansicht
- [ ] **[ASSET]** **Task 028:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Frontend: Gantt-Ansicht
- [ ] **[ASSET]** **Task 029:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Frontend: Mind Map & Whiteboard (Platzhalter/Konzept)
- [ ] **[ASSET]** **Task 030:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Auslastungsansicht (Basis)
- [ ] **[ASSET]** **Task 031:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Portfolio-Ansicht
- [ ] **[ASSET]** **Task 032:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Dashboards & Berichte (Basis)
- [ ] **[ASSET]** **Task 033:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   DB-Schema Charakter/Pet (Erweitert)
- [ ] **[ASSET]** **Task 034:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Gamification Event Listener
- [ ] **[ASSET]** **Task 035:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Gamification API
- [ ] **[ASSET]** **Task 036:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Frontend UI: Charakter/Pet Anzeige
- [ ] **[ASSET]** **Task 037:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Gamification: Punktesystem (Karma)
- [ ] **[SYSTEM]** **Task 038:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Main App / Launcher UI
- [ ] **[ASSET]** **Task 039:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Kommentare API & DB
- [ ] **[ASSET]** **Task 040:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Frontend UI: Kommentare
- [ ] **[ASSET]** **Task 041:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Zuweisungen API