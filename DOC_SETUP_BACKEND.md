# Backend Setup: PostgreSQL & TypeORM

Dieses Dokument beschreibt die Schritt-für-Schritt-Anleitung zur Integration von PostgreSQL als Datenbank und TypeORM als Object-Relational Mapper (ORM) in einem NestJS-Projekt.

## 1. Installation der Abhängigkeiten

Um NestJS mit PostgreSQL über TypeORM zu verbinden, müssen die notwendigen npm-Pakete installiert werden.

```bash
# In Ihrem NestJS-Projektverzeichnis (z.B. api-server) ausführen:
npm install @nestjs/typeorm typeorm pg
```
-   **`@nestjs/typeorm`**: Das offizielle NestJS-Modul zur Integration von TypeORM.
-   **`typeorm`**: Der ORM selbst.
-   **`pg`**: Der Node.js-Treiber für die PostgreSQL-Datenbank.

## 2. Konfiguration der Datenbankverbindung

Die Konfiguration erfolgt idealerweise über Umgebungsvariablen, um sensible Daten aus dem Code fernzuhalten.

### Schritt 2.1: `.env`-Datei erstellen
Erstellen Sie eine `.env`-Datei im Stammverzeichnis Ihres NestJS-Projekts und fügen Sie die Verbindungsdaten hinzu:

```
# .env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres_user
DB_PASSWORD=secret_password
DB_DATABASE=gameforge_db
```
*(Stellen Sie sicher, dass diese Datei in Ihrer `.gitignore` aufgeführt ist, um sie nicht in die Versionskontrolle aufzunehmen.)*

### Schritt 2.2: `ConfigModule` einrichten
Stellen Sie sicher, dass das `@nestjs/config`-Modul in Ihrem `app.module.ts` importiert und global registriert ist, damit die `.env`-Variablen in der gesamten Anwendung verfügbar sind.

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// ... andere Imports

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Macht das Modul global verfügbar
    }),
    // ... andere Module
  ],
})
export class AppModule {}
```

## 3. Erstellung des Datenbank-Moduls

Es ist eine bewährte Methode, die Datenbankkonfiguration in ein eigenes Modul auszulagern.

```typescript
// src/database/database.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Importiert das ConfigModule
      inject: [ConfigService],  // Injiziert den ConfigService, um auf .env-Variablen zuzugreifen
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        // Pfad zu Ihren Entitäten. TypeORM sucht hier nach den Klassen.
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        // Im Development nützlich, um das DB-Schema automatisch anzupassen.
        // In Produktion sollte dies auf 'false' gesetzt und Migrationen verwendet werden.
        synchronize: true, 
      }),
    }),
  ],
})
export class DatabaseModule {}
```

## 4. Integration in das Hauptmodul (`AppModule`)

Importieren Sie das neu erstellte `DatabaseModule` in Ihr Hauptmodul, damit die Anwendung die Datenbankverbindung beim Start herstellt.

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module'; // Importieren
// ... andere Imports

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule, // Hier hinzufügen
    // ... andere Module
  ],
  // ... controllers, providers
})
export class AppModule {}
```

## 5. Verifizierung

Starten Sie Ihre NestJS-Anwendung (`npm run start:dev`). Beobachten Sie die Konsolenausgabe. Wenn keine Verbindungsfehler angezeigt werden, war das Setup erfolgreich. TypeORM gibt oft eine Log-Meldung aus, die eine erfolgreiche Verbindung bestätigt. Bei Fehlern werden detaillierte Informationen in der Konsole angezeigt, die bei der Behebung des Problems helfen.