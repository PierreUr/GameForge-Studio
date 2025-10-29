# Task: Gamification: Punktesystem (Karma)

**Ziel:** Implementierung eines einfachen Punktesystems (Karma), das die ProduktivitÃ¤t des Benutzers visualisiert.

**Anforderungen:**
1.  **Karma-Logik:** Erweiterung des GamificationListenerService, um bei bestimmten Ereignissen (z.B. 	ask.completed) nicht nur XP, sondern auch Karma-Punkte zu vergeben.
2.  **Datenbank-Feld:** Ein karma-Feld in der Character- oder User-EntitÃ¤t.
3.  **API-Erweiterung:** Der /gamification/status-Endpunkt soll auch den aktuellen Karma-Wert zurÃ¼ckgeben.
4.  **UI-Anzeige:** Anzeige des Karma-Wertes im GamificationWidget.
