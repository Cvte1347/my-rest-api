import {
  pgSchema,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

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
  mangadexId: varchar('mangadex_id', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  coverUrl: text('cover_url'),
  status: varchar('status', { length: 20 }).default('ongoing'),
  createdAt: timestamp('created_at').defaultNow(),
});
