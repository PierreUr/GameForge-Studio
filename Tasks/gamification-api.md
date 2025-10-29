# Task: Gamification API

**Ziel:** Erstellung von Backend-Endpunkten zum Abrufen und Aktualisieren von Charakter- und Pet-Daten fÃ¼r den authentifizierten Benutzer.

**Anforderungen:**
1.  **Gamification-Modul:** Ein neues GamificationModule in NestJS.
2.  **Daten-Endpunkt:** Ein GET /gamification/status-Endpunkt, der die aktuellen Charakter- (Level, XP) und Pet-Daten des eingeloggten Benutzers zurÃ¼ckgibt.
3.  **Aktions-Endpunkt:** Ein POST /gamification/pet/feed-Endpunkt als Beispiel fÃ¼r eine Interaktion mit dem Pet.
4.  **Zugriffsschutz:** Alle Endpunkte mÃ¼ssen mit dem JwtAuthGuard geschÃ¼tzt sein.
