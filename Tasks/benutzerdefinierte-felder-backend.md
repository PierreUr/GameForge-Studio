# Task: Benutzerdefinierte Felder (Backend)

**Ziel:** Implementierung der Backend-Logik, die es Benutzern erlaubt, Aufgaben um eigene Felder zu erweitern.

**Anforderungen:**
1.  **FieldDefinition-EntitÃ¤t:** Eine EntitÃ¤t zur Definition von benutzerdefinierten Feldern (z.B. 
ame, 	ype wie 'Text', 'Zahl', 'Datum').
2.  **FieldValue-EntitÃ¤t:** Eine EntitÃ¤t zum Speichern der Werte dieser Felder, mit einer Beziehung zu Task und FieldDefinition.
3.  **API-Erweiterung:** API-Endpunkte zur Verwaltung der Feld-Definitionen und zur Speicherung/Abfrage der Feld-Werte zusammen mit den Aufgaben.
