# Task: DB-Schema Benutzer/Rollen

**Ziel:** Definition der Datenbanktabellen fÃ¼r ein umfassendes Benutzer-, Rollen- und Berechtigungssystem.

**Anforderungen:**
1.  **User-EntitÃ¤t:** Tabelle fÃ¼r Benutzer mit Feldern wie id, username, email, password (hashed), createdAt, updatedAt.
2.  **Role-EntitÃ¤t:** Tabelle fÃ¼r Rollen (id, 
ame, description).
3.  **Permission-EntitÃ¤t:** Tabelle fÃ¼r einzelne Berechtigungen (id, ction, subject).
4.  **Beziehungstabellen:** Many-to-Many-Beziehungen fÃ¼r user_roles und ole_permissions.
