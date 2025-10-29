# Task: Kommentare API & DB

**Ziel:** Implementierung der Backend-FunktionalitÃ¤t fÃ¼r Kommentare zu Aufgaben und Projekten.

**Anforderungen:**
1.  **Comment-EntitÃ¤t:** Eine Comment-EntitÃ¤t in der Datenbank mit Feldern fÃ¼r id, content, createdAt, sowie Beziehungen zu User (Autor) and Task (oder einem Ã¼bergeordneten Element).
2.  **API-Endpunkte:** GET /tasks/:taskId/comments zum Abrufen aller Kommentare fÃ¼r eine Aufgabe und POST /tasks/:taskId/comments zum Erstellen eines neuen Kommentars.
