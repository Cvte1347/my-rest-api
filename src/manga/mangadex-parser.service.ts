import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { firstValueFrom } from 'rxjs';
import { manga } from '../db/schema';

@Injectable()
export class MangadexParserService {
  private readonly logger = new Logger(MangadexParserService.name);
  private readonly db: any;

  constructor(private readonly http: HttpService) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.db = drizzle(pool);
  }

  // Парсинг случайной манги
  async parseRandomManga() {
    try {
      const url = 'https://api.mangadex.org/manga/random?includes[]=cover_art';
      const response = await firstValueFrom(this.http.get(url));
      const mangaData = response.data.data;

      return await this.saveMangaToDb(mangaData);
    } catch (error) {
      this.logger.error('Ошибка парсинга случайной манги:', error);
      throw error;
    }
  }

  // Парсинг манги по ID
  async parseMangaById(mangadexId: string) {
    try {
      const url = `https://api.mangadex.org/manga/${mangadexId}?includes[]=cover_art`;
      const response = await firstValueFrom(this.http.get(url));
      const mangaData = response.data.data;

      return await this.saveMangaToDb(mangaData);
    } catch (error) {
      this.logger.error(`Ошибка парсинга манги ${mangadexId}:`, error);
      throw error;
    }
  }

  // Сохранение в базу данных
  private async saveMangaToDb(mangaData: any) {
    const { id: mangadexId, attributes, relationships } = mangaData;

    // Получаем название (приоритет: en -> ja -> другие)
    const title =
      attributes.title.en ||
      attributes.title.ja ||
      Object.values(attributes.title)[0] ||
      'Unknown Title';

    // Получаем статус
    const status = attributes.status || 'ongoing';

    // Ищем обложку
    const coverRel = relationships?.find((r: any) => r.type === 'cover_art');
    const coverFileName = coverRel?.attributes?.fileName;
    const coverUrl = coverFileName
      ? `https://uploads.mangadex.org/covers/${mangadexId}/${coverFileName}`
      : null;

    // Проверяем, существует ли уже запись
    const existing = await this.db
      .select()
      .from(manga)
      .where(eq(manga.mangadexId, mangadexId))
      .limit(1);

    if (existing.length > 0) {
      // Обновляем существующую запись
      await this.db
        .update(manga)
        .set({
          title,
          coverUrl,
          status,
        })
        .where(eq(manga.mangadexId, mangadexId));

      this.logger.log(`Обновлена манга: ${title} (${mangadexId})`);
      return { ...existing[0], title, coverUrl, status, updated: true };
    } else {
      // Создаем новую запись
      const [newManga] = await this.db
        .insert(manga)
        .values({
          mangadexId,
          title,
          coverUrl,
          status,
        })
        .returning();

      this.logger.log(`Сохранена новая манга: ${title} (${mangadexId})`);
      return { ...newManga, created: true };
    }
  }

  // Парсинг популярных манг
  async parsePopularManga(limit: number = 10) {
    try {
      const url = `https://api.mangadex.org/manga?includes[]=cover_art&order[followedCount]=desc&limit=${limit}`;
      const response = await firstValueFrom(this.http.get(url));
      const mangaList = response.data.data;

      const results: any[] = [];
      for (const mangaData of mangaList) {
        try {
          const result = await this.saveMangaToDb(mangaData);
          results.push(result);
        } catch (error) {
          this.logger.error(`Ошибка сохранения манги ${mangaData.id}:`, error);
        }
      }

      return results;
    } catch (error) {
      this.logger.error('Ошибка парсинга популярных манг:', error);
      throw error;
    }
  }

  // Получить все манги из базы
  async getAllManga() {
    try {
      return await this.db.select().from(manga);
    } catch (error) {
      this.logger.error('Ошибка получения манг из базы:', error);
      throw error;
    }
  }
}
