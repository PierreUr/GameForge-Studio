# Task: Registrierung & Login API

**Ziel:** Erstellung der Backend-Endpunkte fÃ¼r die Benutzerregistrierung und den Login unter Verwendung von JSON Web Tokens (JWT) fÃ¼r die Authentifizierung.

**Anforderungen:**
1.  **Auth-Modul:** Erstellung eines AuthModule in NestJS.
2.  **Registrierungs-Endpunkt:** Ein POST-Endpunkt, der username, email und password entgegennimmt, einen neuen Benutzer erstellt und speichert.
3.  **Login-Endpunkt:** Ein POST-Endpunkt, der email und password prÃ¼ft und bei Erfolg einen JWT zurÃ¼ckgibt.
4.  **JWT-Strategie:** Implementierung einer Passport.js-basierten JWT-Strategie zur Validierung von Tokens.
