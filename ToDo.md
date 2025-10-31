# GameForge Studio - Entwicklungsplan

**Projekt:** GameForge Studio  
**Version:** 1.20.0  
**Gesamtanzahl Tasks:** 160
**Status:** In Entwicklung

## Arbeitsschritte

- [ ] **[SYSTEM]** **Task 177:** UI-Builder Bugfixes & Layout-Verbesserungen
    - [X] **BUG:** Drag & Drop für Sektionen ist fehlerhaft.
    - [X] **BUG:** Drag & Drop für Widgets innerhalb von Spalten ist instabil, führt zu Abstürzen und verhindert das Stapeln von >2 Elementen.
    - [X] **BUG:** Vertikales Scrollen im UI-Editor Canvas ist nicht möglich.
    - [ ] **BUG:** Das Löschen von Widgets (über Inspector 'X' und Rechtsklick-Menü) funktioniert nicht.
    - [ ] **BUG:** Das Hinzufügen einer neuen Sektion ist nur am Anfang des Layouts möglich, nicht mehr zwischen oder nach bestehenden Sektionen.
    - [ ] **BUG:** Im `LibraryPanel` erscheint ein doppelter Scrollbalken, wenn Kategorien aufgeklappt werden.
    - [ ] **BUG:** Verschachtelte Sektionen haben einen unerwünschten vertikalen Abstand, obwohl alle Margin/Padding-Werte auf 0 gesetzt sind.
    - [X] **FEATURE:** Abstand zwischen Spalten in einer Sektion ist nicht einstellbar.
    - [X] **FEATURE:** es soll sich soverhalten wie ein Websiten Designer kein Abstand zum rand usw. es gibt ohne ihn eingesstellt zu haben der Rahmen z.B. eines Section soll sehr schmall sien um 0 PX zum randhaben
    - [x] **FEATURE:** Die Modies für Table / Mobile / Desktop sollen je weil als eigenes design gespeichert werden können der Switch sollen oben link als overlay im Bearbeitungscanvas sei
    - [x] **[FEATURE]** Neue Speicher-Buttons (Disketten-Icons) und "Save As..."-Funktionalität implementieren.
    - [x] **[FEATURE]** Upload/Laden von Projekt-Designs ermöglichen.
    - [ ] **[FEATURE]** Verschachtelte Sektionen (Sektion in Sektion) ermöglichen.
    - [x] **[DOC]** Projekt-Datei-Format im Handbuch dokumentieren.
    - [ ] **[FEATURE]** Das Handbuch soll über einen Button in einem Fenster innerhalb der Applikation geladen werden können.
    - [ ] **FEATURE:** die gänigen Optionen wie Backgound-Color oder Image sowie generelle H1 und classen eingenschaften usw. soll beim auswählen im INspektor eingestellt werden können
    - [ ] **FEATURE:** Spaltenbreiten innerhalb einer Sektion sollen per Drag & Drop anpassbar sein.
    - [X] **FEATURE:** Spacer-Verhalten ist unklar (erstellt eine komplette Sektion).
    - [X] **FEATURE:** "Add Widget"-Button in Spalten zum schnellen Hinzufügen von Widgets implementiert.
- [ ] **[SYSTEM]** **Task 178:** Implementierung des Fenster- und Popup-Systems (Siehe `Tasks/178-feature-window-system.md`)
- [ ] **[SYSTEM]** **Task 179:** Implementierung von Inspector-Hilfe-Tooltips für alle Komponenten
- [x] **[SYSTEM]** **Task 171:** Implementierung eines Systems zum Rendern von UI-Assets im Editor
- [x] **[ASSET]** **Task 172:** Refactoring des Aufgaben-Moduls in atomare Widgets
- [x] **[SYSTEM]** **Task 173:** Implementierung des UI-Builders (Phase 1: Layout-System)
- [x] **[SYSTEM]** **Task 174:** Implementierung des UI-Builders (Phase 2: Widget-Bibliothek & Inspector)
- [x] **[SYSTEM]** **Task 175:** UI-Builder-Verbesserungen (Phase 1: Input-Fix, Layout & Bibliotheks-Organisation)
- [ ] **[SYSTEM]** **Task 176:** UI-Builder: Reordering von Layout-Sektionen per Drag & Drop
- [x] **Task 001:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   UI-Setup (Progress-Bar)
- [x] **Task 002:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Handbuch-Initialisierung
- [x] **Task 003:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Backend-Framework Setup
- [x] **Task 004:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Datenbank Setup & ORM
- [x] **Task 005:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   API-Grundstruktur (REST/GraphQL)
- [x] **Task 006:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Konfigurations-Management
- [x] **Task 007:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   DB-Schema Benutzer/Rollen
- [x] **Task 008:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Registrierung & Login API
- [x] **Task 009:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Rollen-Management API
- [x] **Task 010:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   API-Berechtigungsprüfung (Guards)
- [x] **Task 011:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Frontend Auth-Logik
- [x] **Task 012:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Admin-UI Benutzer-/Rollenverwaltung
- [x] **Task 013:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   DB-Schema Module
- [x] **Task 014:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Modul-Registry API
- [x] **Task 015:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Admin-UI Modulverwaltung
- [x] **Task 016:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   API für Modul-Konfiguration
- [x] **Task 017:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   DB-Schema Aufgaben (Erweitert)
- [x] **Task 018:** File Location `/Taks` for details, Execute Order in `/Prompts` in as CSV files with Name   Aufgaben-CRUD API (Erweitert)
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