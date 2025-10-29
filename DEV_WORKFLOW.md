# Entwicklungs-Workflow des KI-Assistenten

Dieses Dokument beschreibt den präzisen und regelgesteuerten Prozess, den ich als KI-Entwickler-Assistent für das GameForge Studio befolge.

## 1. Kernprinzipien

Meine gesamte Arbeit basiert auf drei fundamentalen Prinzipien, die durch die Projekt-Richtlinien vorgegeben sind:

-   **Aufgabenbasiert:** Ich arbeite ausschließlich die in `ToDo.md` definierten Tasks ab. Die Reihenfolge in dieser Datei bestimmt die exakte Priorität.
-   **Atomare Schritte:** Jeder Task wird in kleinste, atomare Schritte zerlegt. Die genaue Anweisung für jeden Schritt ist in einer zugehörigen `.csv`-Datei im `ToDos/Prompts/`-Verzeichnis definiert. Dies stellt maximale Präzision sicher.
-   **Regelgesteuert:** Mein Verhalten, meine Konventionen und meine Arbeitsabläufe sind strikt durch die `Master-Prompt.md` und die `DOC_REGELN_*.md` Dateien definiert.

## 2. Der 3-Stufige Abarbeitungsprozess

Jeder Task wird in einem klar definierten, dreistufigen Prozess ausgeführt, um Nachvollziehbarkeit und Konsistenz zu gewährleisten.

### Stufe 1: Priorität aus `ToDo.md` ermitteln
Meine erste Aktion ist immer das Lesen der `ToDo.md`. Ich identifiziere den obersten, noch nicht als erledigt (`- [x]`) markierten Eintrag. Dieser Task hat die höchste Priorität.

### Stufe 2: Spezifikation aus `ToDos/[TASK-SLUG].md` laden
Basierend auf dem Task-Namen (Slug) aus `ToDo.md` lade ich die zugehörige Spezifikationsdatei. Diese Markdown-Datei enthält:
-   Eine detaillierte Beschreibung des Ziels.
-   Die genauen Anforderungen.
-   Eine Checkliste der atomaren Unterschritte, die zur Erledigung des Tasks notwendig sind.

### Stufe 3: Atomaren Prompt aus `ToDos/Prompts/[...].csv` ausführen
Für jeden Punkt in der Checkliste der Task-Spezifikation existiert eine CSV-Datei. Diese Datei ist meine exakte Handlungsanweisung und enthält:
-   **Ziel:** Was genau soll ich tun (z.B. Code generieren, Test beschreiben).
-   **Kontext:** Welche Dateien muss ich als Referenz lesen.
-   **Ergebnis:** Was ist das erwartete Artefakt (Code-Snippet, Dokumentationstext etc.).

Ich arbeite diese atomaren Prompts sequenziell ab, bis der gesamte Task abgeschlossen ist.

## 3. Kritischer Selbstkorrektur-Workflow

Bevor ich mit einem neuen Task aus der `ToDo.md` beginne, führe ich einen **obligatorischen Selbstkorrektur-Check** durch:

1.  **Analyse des Testprotokolls:** Ich greife auf das letzte Testprotokoll zu, das im `localStorage` des Browsers unter dem Schlüssel `test-execution-log` gespeichert ist.
2.  **Fehler identifizieren:** Ich suche nach `[ERROR]`, `[CRITICAL]` oder unerwarteten `[FAILURE]`-Meldungen.
3.  **Priorisierung der Fehlerbehebung:**
    -   **Wenn Fehler gefunden werden:** Die Behebung des Fehlers hat absolute Priorität. Ich fahre **nicht** mit dem nächsten Task fort, sondern beginne sofort mit der Fehleranalyse und -behebung.
    -   **Wenn keine Fehler gefunden werden:** Ich bestätige den Erfolg der Tests und fahre mit dem nächsten geplanten Task fort.

**Diese Regel hat die höchste Priorität. Es werden keine neuen Features implementiert, solange die Codebasis fehlerhaft ist.**

## 4. Umgang mit User-Anfragen (Bugs & Ideen)

Wenn ein Benutzer einen Bug meldet oder eine neue Idee einbringt, folge ich als "Senior Engineer" diesem standardisierten Prozess:

1.  **Bug protokollieren:** Der Bug wird zuerst in `BUGLOG.md` eingetragen.
2.  **Details anfordern:** Ich frage den Benutzer nach weiteren Informationen, um das Problem vollständig zu verstehen.
3.  **Atomare Planung:** Ich erstelle alle notwendigen Planungsdateien für den Bugfix (Task-Slug, `ToDos/[TASK-SLUG].md`, `ToDos/Prompts/[...].csv`).
4.  **`ToDo.md` aktualisieren:** Der neue Bugfix-Task wird mit hoher Priorität in die `ToDo.md`-Liste eingefügt.