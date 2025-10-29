# Task: API fÃ¼r Modul-Konfiguration

**Ziel:** Erstellung eines API-Endpunkts, Ã¼ber den aktive Module ihre spezifische Konfiguration abrufen kÃ¶nnen.

**Anforderungen:**
1.  **Config-Endpunkt:** Ein GET /modules/:moduleName/config-Endpunkt.
2.  **Logik:** Der Endpunkt soll die Konfiguration fÃ¼r das angefragte Modul aus einer separaten Konfigurationstabelle oder einem JSON-Feld in der Module-Tabelle laden.
3.  **Autorisierung:** Der Zugriff sollte auf authentifizierte Benutzer beschrÃ¤nkt sein, potenziell mit weiteren PrÃ¼fungen je nach Modul.
