import { pgTable, serial, varchar, text, timestamp, pgSchema, integer } from 'drizzle-orm/pg-core';

// Создаём схему users
export const usersSchema = pgSchema('users');

// Таблица в схеме users
export const users = usersSchema.table('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Создаём схему mangalib
export const mangalibSchema = pgSchema('mangalib');

// Таблица manga
export const manga = mangalibSchema.table('manga', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  author: varchar('author', { length: 100 }),
  description: text('description'),
  coverUrl: text('cover_url'),
  status: varchar('status', { length: 20 }).default('ongoing'),
  rating: varchar('rating', { length: 5 }),
  chaptersCount: integer('chapters_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});