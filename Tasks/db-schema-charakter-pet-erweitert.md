# Task: DB-Schema Charakter/Pet (Erweitert)

**Ziel:** Erweiterung des DB-Schemas zur Speicherung von Gamification-Daten wie Charakter-Level, Erfahrungspunkte (XP) und dem Zustand eines virtuellen Pets.

**Anforderungen:**
1.  **Character-EntitÃ¤t:** Eine Tabelle (oder Erweiterung der User-Tabelle) fÃ¼r Charakterdaten wie level, xp, xpForNextLevel.
2.  **Pet-EntitÃ¤t:** Eine Tabelle fÃ¼r den Zustand des Pets, z.B. hunger, happiness, lastFed.
3.  **Beziehung:** Eine One-to-One-Beziehung zwischen User, Character und Pet.
