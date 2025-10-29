# Backend Setup: User, Role & Permission Schema

This document describes the step-by-step process for defining the database schema for a flexible user, role, and permission system using TypeORM entities in a NestJS project.

## 1. Goal

The goal is to create a relational structure that allows:
-   **Users** to have multiple **Roles**.
-   **Roles** to have multiple **Permissions**.
-   This enables a robust and scalable access control system.

## 2. Entity Definitions

The schema is implemented through three main TypeORM entities: `User`, `Role`, and `Permission`.

### Step 2.1: Permission Entity
This is the most granular entity, representing a single action on a specific subject (e.g., 'create' on 'Task').

```typescript
// src/roles/entities/permission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // e.g., 'task.create'
  action: string; 

  @Column()
  subject: string; // e.g., 'Allows creating a new task'
}
```

### Step 2.2: Role Entity
A role is a collection of permissions.

```typescript
// src/roles/entities/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from './permission.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // e.g., 'ADMIN', 'USER'

  @ManyToMany(() => Permission, { eager: true }) // eager loading simplifies permission checks
  @JoinTable({ name: 'role_permissions_permission' }) // Explicit join table name
  permissions: Permission[];
}
```

### Step 2.3: User Entity
The user entity connects to one or more roles.

```typescript
// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string; // Password should always be hashed

  @ManyToMany(() => Role, { eager: true })
  @JoinTable({ name: 'user_roles_role' }) // Explicit join table name
  roles: Role[];
}
```

## 3. Verifizierung

To verify that the schema is correctly defined and will be created properly by the database:
1.  **Start the Application:** Run your NestJS application in development mode (`npm run start:dev`).
2.  **Check `synchronize: true`:** Ensure that the `synchronize` option in your `TypeOrmModule` configuration is set to `true`. This will instruct TypeORM to automatically create or update the database tables to match your entity definitions.
3.  **Inspect the Database:** Use a database client (like DBeaver, pgAdmin, or the command line) to connect to your PostgreSQL database.
4.  **Confirm Table Creation:** Verify that the following tables have been created:
    -   `user`
    -   `role`
    -   `permission`
    -   `user_roles_role` (join table for users and roles)
    -   `role_permissions_permission` (join table for roles and permissions)
5.  **Check Columns & Relations:** Inspect the columns of each table to ensure they match the properties defined in the entities. Verify that the foreign key constraints have been set up correctly in the join tables.
