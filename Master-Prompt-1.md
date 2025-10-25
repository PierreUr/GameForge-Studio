# Master-Prompt: GameForge Studio Entwicklungsrichtlinien

## ProjektÃ¼bersicht
GameForge Studio ist eine webbasierte, fenstergesteuerte Entwicklungsumgebung (IDE) zur Erstellung von Spielen.

## Technologie-Stack
- **Sprache**: TypeScript (ES6+)
- **Architektur**: Entity-Component-System (ECS)
- **Frontend**: Web-Komponenten, CSS Grid
- **Rendering**: HTML5 Canvas mit Pixi.js

## ECS-Prinzipien
- **Entity**: Spielobjekt mit eindeutiger ID
- **Component**: Datencontainer mit isActive-Flag
- **System**: Logik fÃ¼r Component-Kombinationen

## Entwicklungsstandards
- Type-Hints fÃ¼r alle Funktionen
- TSDoc-Dokumentation erforderlich
- Explizite Fehlerbehandlung
- Jest Unit-Tests fÃ¼r alle Komponenten

## Logging-Konvention
[SUCCESS] [task-slug] produced the expected outcome.
[FAILURE] [task-slug] correctly handled invalid input.
