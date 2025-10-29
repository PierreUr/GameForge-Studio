# Task: API-BerechtigungsprÃ¼fung (Guards)

**Ziel:** Implementierung von Schutzmechanismen (Guards) in NestJS, die API-Endpunkte basierend auf den Rollen und Berechtigungen des authentifizierten Benutzers absichern.

**Anforderungen:**
1.  **JWT-Auth Guard:** Ein globaler Guard, der prÃ¼ft, ob ein gÃ¼ltiger JWT vorhanden ist.
2.  **Roles Guard:** Ein Guard, der prÃ¼ft, ob der Benutzer die erforderliche Rolle besitzt, um auf einen Endpunkt zuzugreifen.
3.  **Custom Decorator:** Ein @Roles()-Decorator zur einfachen Deklaration der benÃ¶tigten Rollen an Controllern oder Routen.
