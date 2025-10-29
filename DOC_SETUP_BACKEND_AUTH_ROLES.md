# Backend Setup: Real-World Authentication & Roles API

This document provides a comprehensive guide for implementing a production-ready authentication (JWT) and role-based access control (RBAC) system in a NestJS application using TypeORM and PostgreSQL. It builds upon the database and schema setup outlined in `DOC_SETUP_BACKEND.md` and `DOC_SETUP_BACKEND_SCHEMA_USER_ROLES.md`.

## 1. Prerequisites

Before proceeding, ensure the following are already set up:
1.  A NestJS project is initialized.
2.  PostgreSQL database is running.
3.  TypeORM is configured to connect to the database (`DatabaseModule`).
4.  The `User`, `Role`, and `Permission` entities are defined as per `DOC_SETUP_BACKEND_SCHEMA_USER_ROLES.md`.

## 2. Installation of Dependencies

Install the necessary packages for authentication and password hashing.

```bash
npm install @nestjs/passport passport passport-local @nestjs/jwt passport-jwt bcrypt
npm install -D @types/passport-local @types/passport-jwt @types/bcrypt
```
-   **`@nestjs/passport`, `passport`, `passport-local`**: Core packages for implementing local (email/password) authentication strategy.
-   **`@nestjs/jwt`, `passport-jwt`**: Packages for creating and validating JSON Web Tokens (JWT).
-   **`bcrypt`**: A library for hashing passwords.

## 3. Users Module

This module is responsible for all user-related database operations.

### Step 3.1: Create the Module
Create a `UsersModule` that provides the `UsersService`.

```typescript
// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService], // Export for use in AuthModule
})
export class UsersModule {}
```

### Step 3.2: Implement the `UsersService`
This service handles direct database interactions for the `User` entity.

```typescript
// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(email: string, password: string): Promise<User> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const newUser = this.usersRepository.create({ email, passwordHash });
    // Note: Default roles should be handled here if necessary,
    // e.g., by fetching a default 'USER' role and assigning it.
    
    await this.usersRepository.save(newUser);
    return newUser;
  }
}
```

## 4. Auth Module

This module orchestrates the login and registration logic.

### Step 4.1: Create the `AuthModule`
Set up the module with `JwtModule` for token generation.

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
```
*Note: Add a `JWT_SECRET` variable to your `.env` file.*

### Step 4.2: Implement the `AuthService`
This service contains the core logic for validating users and signing JWTs.

```typescript
// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, roles: user.roles.map(r => r.name) };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

### Step 4.3: Implement the JWT Strategy
This strategy is used by Passport to validate incoming JWTs on protected routes.

```typescript
// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // The payload is the decoded JWT. Passport builds a user object based on the return value.
    return { userId: payload.sub, email: payload.email, roles: payload.roles };
  }
}
```

### Step 4.4: Create the `AuthController`
This controller exposes the public `/auth/login` and `/auth/register` endpoints.

```typescript
// src/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: any) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    // Add validation DTOs in a real application
    return this.usersService.create(registerDto.email, registerDto.password);
  }
}
```

## 5. Roles & Permissions Management

This section covers the API for managing roles and assigning them to users.

### Step 5.1: Create `RolesModule` and `RolesService`
The service will use the `Role` repository for database operations.

```typescript
// src/roles/roles.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  // ... Implement create, update, delete methods
}
```
*(The module follows the same pattern as `UsersModule`)*

### Step 5.2: Create the `RolesController`
This controller exposes CRUD endpoints for roles, protected by authentication and authorization guards.

```typescript
// src/roles/roles.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes in this controller
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @Roles('ADMIN') // Only users with the ADMIN role can access this
  findAll() {
    return this.rolesService.findAll();
  }

  // ... Implement POST, PUT, DELETE endpoints with appropriate role protection
}
```

## 6. Implementing Authorization Guards

This section contains the actual implementation for the Guards and Decorators used to protect endpoints.

### Step 6.1: `Roles` Decorator
This custom decorator attaches role metadata to a route handler.

```typescript
// src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### Step 6.2: `JwtAuthGuard`
This guard protects routes by ensuring a valid JWT is present. It's a simple extension of the built-in Passport guard.

```typescript
// src/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### Step 6.3: `RolesGuard`
This guard checks if the user associated with the request has the required roles specified by the `@Roles()` decorator.

```typescript
// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // Check if the user object and its roles array exist, and if any of the user's roles
    // match the required roles.
    return requiredRoles.some((role) => user?.roles?.includes(role));
  }
}
```

## 7. Final Integration

Finally, import all the feature modules into the main `AppModule`.

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
  ],
})
export class AppModule {}
```