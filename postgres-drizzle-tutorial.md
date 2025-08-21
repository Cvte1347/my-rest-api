# PostgreSQL + Drizzle ORM Tutorial

## Установка и настройка

### 1. Установка Yarn через Corepack
```bash
node -v
corepack enable
yarn -v
```

Если `corepack` не найден:
```bash
npm i -g corepack
corepack enable
```

### 2. Установка PostgreSQL
```bash
brew install postgresql@16
brew services start postgresql@16
```

### 3. Создание базы данных
```bash
# Создать пользователя
createuser -P emirasanbekov

# Создать базу
createdb -O emirasanbekov MANGA

# Проверить подключение
psql "postgres://emirasanbekov:ВАШ_ПАРОЛЬ@localhost:5432/MANGA" -c "SELECT now();"
```

### 4. Установка Drizzle в проекте
```bash
cd /Users/emirasanbekov/my-rest-api
yarn add drizzle-orm pg
yarn add -D drizzle-kit @types/pg
```

## Работа с PostgreSQL

### Создание схемы
```sql
-- Создать схему
CREATE SCHEMA mangalib;

-- Создать схему с владельцем
CREATE SCHEMA mangalib AUTHORIZATION emirasanbekov;

-- Создать несколько схем
CREATE SCHEMA users;
CREATE SCHEMA manga;
CREATE SCHEMA auth;
```

### Создание таблицы в схеме
```sql
-- Создать таблицу в схеме mangalib
CREATE TABLE mangalib.manga (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100),
    description TEXT,
    cover_url TEXT,
    status VARCHAR(20) DEFAULT 'ongoing',
    rating VARCHAR(5),
    chapters_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Полезные команды PostgreSQL
```sql
-- Показать все схемы
\dn

-- Показать таблицы в схеме
\dt mangalib.*

-- Показать структуру таблицы
\d mangalib.manga

-- Переключиться на базу
\c MANGA

-- Показать все базы
\l

-- Показать всех пользователей
\du
```

### Удаление схем и таблиц
```sql
-- Удалить схему со всем содержимым
DROP SCHEMA mangalib CASCADE;

-- Удалить схему только если пустая
DROP SCHEMA mangalib;

-- Удалить схему без ошибки, если её нет
DROP SCHEMA IF EXISTS mangalib CASCADE;

-- Удалить таблицу
DROP TABLE mangalib.manga;

-- Удалить базу данных
DROP DATABASE "MANGA";
```

## Drizzle ORM

### Создание схемы `src/db/schema.ts`
```typescript
import { pgTable, serial, varchar, text, timestamp, pgSchema, integer } from 'drizzle-orm/pg-core';

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
  mangadexId: varchar('mangadex_id', { length: 50 }).unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Создаём схему users
export const usersSchema = pgSchema('users');

// Таблица users
export const users = usersSchema.table('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  age: integer('age').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### Подключение к базе `src/db/index.ts`
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Создаём подключение к базе
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://emirasanbekov@localhost:5432/MANGA',
});

// Создаём экземпляр Drizzle
export const db = drizzle(pool, { schema });

// Экспортируем схемы для миграций
export * from './schema';
```

### Конфигурация `drizzle.config.ts`
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgres://emirasanbekov@localhost:5432/MANGA',
  },
} satisfies Config;
```

### Переменные окружения `.env`
```env
DATABASE_URL=postgres://emirasanbekov@localhost:5432/MANGA
```

### Скрипты в `package.json`
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Создание миграций
```bash
# Сгенерировать миграцию
yarn db:generate

# Применить миграцию к базе
yarn db:migrate

# Запустить Drizzle Studio
yarn db:studio
```

## Парсер для Mangadex

### Установка зависимостей
```bash
yarn add axios cheerio
yarn add -D @types/cheerio
```

### Парсер `src/manga/manga-parser.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class MangaParserService {
  private readonly baseUrl = 'https://mangadex.org';

  async parseMangaCover(mangaId: string): Promise<string | null> {
    try {
      const url = `${this.baseUrl}/title/${mangaId}`;
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      
      const coverUrl = $('.manga-cover img').attr('src') || 
                      $('.card-img-top').attr('src') ||
                      $('img[alt*="cover"]').attr('src');
      
      return coverUrl || null;
    } catch (error) {
      console.error(`Error parsing cover for manga ${mangaId}:`, error.message);
      return null;
    }
  }

  async parseMangaInfo(mangaId: string) {
    try {
      const url = `${this.baseUrl}/title/${mangaId}`;
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      
      const title = $('.manga-title h1').text().trim() || 
                   $('h1').first().text().trim();
      
      const description = $('.manga-description').text().trim() ||
                         $('.description').text().trim();
      
      const author = $('.manga-author').text().trim() ||
                    $('a[href*="/author/"]').first().text().trim();
      
      const status = $('.manga-status').text().trim() || 'unknown';
      
      const coverUrl = await this.parseMangaCover(mangaId);
      
      return {
        title,
        author,
        description,
        status,
        coverUrl,
        mangadexId: mangaId
      };
    } catch (error) {
      console.error(`Error parsing manga ${mangaId}:`, error.message);
      return null;
    }
  }
}
```

### Сервис `src/manga/manga.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { manga } from '../db/schema';
import { eq } from 'drizzle-orm';
import { MangaParserService } from './manga-parser.service';

@Injectable()
export class MangaService {
  constructor(private readonly mangaParserService: MangaParserService) {}

  // Получить все манги из БД
  async findAll() {
    return await db.select().from(manga);
  }

  // Получить мангу по ID из БД
  async findOne(id: number) {
    const result = await db
      .select()
      .from(manga)
      .where(eq(manga.id, id));
    return result[0];
  }

  // Парсить и сохранить мангу с Mangadex
  async parseAndSave(mangadexId: string) {
    const mangaInfo = await this.mangaParserService.parseMangaInfo(mangadexId);
    
    if (!mangaInfo) {
      throw new Error(`Failed to parse manga ${mangadexId}`);
    }

    // Проверяем, не существует ли уже манга с таким mangadexId
    const existing = await db
      .select()
      .from(manga)
      .where(eq(manga.mangadexId, mangadexId));

    if (existing.length > 0) {
      return existing[0];
    }

    // Сохраняем в БД
    const result = await db
      .insert(manga)
      .values(mangaInfo)
      .returning();
    return result[0];
  }

  // Создать новую мангу
  async create(data: { 
    title: string; 
    author?: string; 
    description?: string; 
    coverUrl?: string; 
    status?: string; 
    rating?: string; 
    mangadexId?: string;
  }) {
    const result = await db
      .insert(manga)
      .values(data)
      .returning();
    return result[0];
  }
}
```

### Контроллер `src/manga/manga.controller.ts`
```typescript
import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { MangaService } from './manga.service';

@Controller('manga')
export class MangaController {
  constructor(private readonly mangaService: MangaService) {}

  // Получить все манги
  @Get()
  findAll() {
    return this.mangaService.findAll();
  }

  // Получить мангу по ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mangaService.findOne(id);
  }

  // Парсить и сохранить мангу с Mangadex
  @Post('parse/:mangadexId')
  parseManga(@Param('mangadexId') mangadexId: string) {
    return this.mangaService.parseAndSave(mangadexId);
  }

  // Создать мангу вручную
  @Post()
  create(@Body() createMangaDto: {
    title: string;
    author?: string;
    description?: string;
    coverUrl?: string;
    status?: string;
    rating?: string;
  }) {
    return this.mangaService.create(createMangaDto);
  }
}
```

## Тестирование API

### Команды для тестирования
```bash
# Получить все манги
curl http://localhost:3000/manga

# Получить мангу по ID
curl http://localhost:3000/manga/1

# Парсить мангу с Mangadex (например, One Piece)
curl -X POST http://localhost:3000/manga/parse/a1c7c817-4e59-4b7a-9f12-0719e92f8c0f

# Создать мангу вручную
curl -X POST http://localhost:3000/manga \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Manga",
    "author": "Test Author",
    "description": "Test Description"
  }'
```

## Типы данных в Drizzle

- `serial()` — автоинкрементное число (SERIAL)
- `varchar({ length: n })` — строка максимум n символов (VARCHAR)
- `text()` — строка неограниченной длины (TEXT)
- `timestamp()` — дата и время (TIMESTAMP)
- `integer()` — целое число (INTEGER)
- `decimal({ precision: p, scale: s })` — десятичное число (DECIMAL)
- `boolean()` — логическое значение (BOOLEAN)
- `json()` — JSON данные (JSON)

## Ограничения в Drizzle

- `.primaryKey()` — главный ключ
- `.notNull()` — поле обязательно
- `.unique()` — значение должно быть уникальным
- `.default(value)` — значение по умолчанию
- `.references(() => table.field)` — внешний ключ

## Частые ошибки и решения

### PostgreSQL
- "database does not exist" → создайте базу: `CREATE DATABASE MANGA;`
- "password authentication failed" → проверьте пароль в DATABASE_URL
- "could not connect to server" → запустите: `brew services start postgresql@16`
- "schema is not empty" → используйте `CASCADE` при удалении

### Drizzle
- "relation does not exist" → выполните миграцию: `yarn db:migrate`
- "column does not exist" → обновите схему и создайте новую миграцию
- "connection refused" → проверьте DATABASE_URL и запуск PostgreSQL

## Полезные команды

```bash
# Проверить статус PostgreSQL
brew services list | grep postgres

# Запустить PostgreSQL
brew services start postgresql@16

# Остановить PostgreSQL
brew services stop postgresql@16

# Проверить порт
lsof -i :5432

# Создать пользователя
createuser -P username

# Создать базу
createdb -O username database_name

# Удалить базу
dropdb database_name
```

---

**Создано в рамках изучения PostgreSQL и Drizzle ORM**
