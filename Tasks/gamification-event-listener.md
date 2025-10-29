# Task: Gamification Event Listener

**Ziel:** Implementierung eines Backend-Services, der auf spielrelevante Ereignisse (z.B. Abschluss einer Aufgabe) hÃ¶rt und entsprechende Gamification-Logik auslÃ¶st (z.B. XP-Vergabe).

**Anforderungen:**
1.  **Event-System:** Nutzung des internen Event-Emitters von NestJS (EventEmitterModule).
2.  **Event-Listener:** Ein Service, der auf Events wie 	ask.completed lauscht.
3.  **Logik:** Wenn ein Event empfangen wird, soll die XP des entsprechenden Benutzers erhÃ¶ht und geprÃ¼ft werden, ob ein Level-Up stattfindet.
