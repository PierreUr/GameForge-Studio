# Backend Setup: Module Schema

This document describes the process for defining the database schema for system module management using TypeORM in a NestJS project.

## 1. Goal

The objective is to create a database table to store metadata about installable and available modules within the GameForge Studio system. This allows for dynamic activation/deactivation and configuration of system features.

## 2. Entity Definition

The schema is implemented via a `Module` TypeORM entity.

### Step 2.1: Module Entity
This entity contains all the necessary metadata for a system module.

```typescript
// src/modules/entities/module.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Module {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  version: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: false })
  isActive: boolean;

  /**
   * Stores a JSON schema that defines the structure of the module's
   * configuration object. Using 'jsonb' is recommended for PostgreSQL
   * for better performance and indexing capabilities.
   */
  @Column({ type: 'jsonb', nullable: true, default: () => "'{}'" })
  configSchema: Record<string, any>;
}
```

## 3. Verification

As per the task requirements, the primary method to verify the correct creation of this schema is through a database migration or synchronization.

**Test Steps:**

1.  **Code Generation:** After creating the entity file as shown above, ensure it is included in the `entities` array of your `TypeOrmModule` configuration in `database.module.ts`.
2.  **Generate Migration (Recommended for Production):**
    -   Run the TypeORM CLI command to generate a new migration file:
        ```bash
        npm run typeorm migration:generate -- -n CreateModuleTable
        ```
    -   Inspect the generated migration file (e.g., in `src/migration/`). It should contain the SQL `CREATE TABLE "module" ...` with all the specified columns. The `name` column should have a `UNIQUE` constraint, and the `configSchema` column should have the type `jsonb`.
3.  **Run Migration:**
    -   Execute the migration to apply the changes to the database:
        ```bash
        npm run typeorm migration:run
        ```
4.  **Database Inspection:**
    -   Connect to your PostgreSQL database using a client like pgAdmin or DBeaver.
    -   Verify that the new `module` table exists.
    -   Inspect the table's columns and constraints to confirm they match the entity definition (e.g., `id`, `name (unique)`, `version`, `description`, `isActive`, `configSchema (jsonb)`).

**Alternative (Development Only):**

-   If you are using `synchronize: true` in your TypeORM configuration, simply starting the NestJS application (`npm run start:dev`) will cause TypeORM to automatically create the `module` table. You can then proceed directly to Step 4 (Database Inspection) to verify the result.