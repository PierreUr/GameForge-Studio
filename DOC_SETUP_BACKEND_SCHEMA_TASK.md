# Backend Setup: Extended Task Schema

This document describes the target database schema for the extended `Task` entity and the new `Tag` entity using TypeORM.

## 1. Goal

To create a robust schema that supports hierarchical tasks, dependencies, detailed properties, and relations to users and tags.

## 2. Entity Definitions

### Tag Entity
A simple entity for categorizing tasks.

```typescript
// src/tags/entities/tag.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: '#cccccc' })
  color: string;
}
```

### Task Entity
The core entity for task management with all required fields and relations.

```typescript
// src/tasks/entities/task.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, Tree, TreeChildren, TreeParent, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tag } from '../../tags/entities/tag.entity';

@Entity()
@Tree("closure-table") // Using closure-table for hierarchy
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['backlog', 'todo', 'inprogress', 'done', 'canceled'],
    default: 'todo'
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['none', 'low', 'medium', 'high'],
    default: 'none'
  })
  priority: string;

  @Column({ default: false })
  isMilestone: boolean;

  @Column({ type: 'jsonb', nullable: true })
  checklist: { text: string; completed: boolean }[];

  @Column({ nullable: true })
  recurrenceRule?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;
  
  @TreeChildren()
  children: Task[];

  @TreeParent()
  parent: Task;
  
  @ManyToMany(() => User)
  @JoinTable({ name: 'task_assignees_user' })
  assignees: User[];

  @ManyToMany(() => Tag)
  @JoinTable({ name: 'task_tags_tag' })
  tags: Tag[];

  @ManyToMany(() => Task)
  @JoinTable({ name: 'task_dependencies_task' })
  dependencies: Task[];
}
```
