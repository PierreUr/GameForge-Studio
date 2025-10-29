# Task: Automatisierungs-Engine (Backend - Basis)

**Ziel:** Implementierung einer grundlegenden Engine im Backend, die auf Trigger (z.B. StatusÃ¤nderung) reagieren und einfache Aktionen (z.B. Zuweisung Ã¤ndern) ausfÃ¼hren kann.

**Anforderungen:**
1.  **Rule-EntitÃ¤t:** Eine AutomationRule-EntitÃ¤t (z.B. 	riggerType, 	riggerCondition, ctionType, ctionPayload).
2.  **Event-Listener:** Ein Listener (z.B. auf dem internen Event-Emitter), der auf relevante Ereignisse wie 	ask.status.changed hÃ¶rt.
3.  **Rule-Processor:** Eine Logik, die bei einem Trigger alle passenden Regeln findet und die definierten Aktionen ausfÃ¼hrt.
