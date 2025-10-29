# Task: Zuweisungen API & DB

**Ziel:** Erweiterung der Aufgaben-API und -DB zur Zuweisung von Aufgaben an einen oder mehrere Benutzer.

**Anforderungen:**
1.  **DB-Anpassung:** Die Many-to-Many-Beziehung zwischen Task und User (aus Task 017) ist die Grundlage.
2.  **API-Erweiterung:** Die POST /tasks- und PUT /tasks/:id-Endpunkte mÃ¼ssen ein Array von ssigneeIds akzeptieren und die Zuweisungen entsprechend in der Datenbank speichern.
