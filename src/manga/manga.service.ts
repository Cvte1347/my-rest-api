// src/manga/manga.service.ts
import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  CoverResult,
  CoverSize,
  MangaDexManga,
  MangaDexResponse,
} from './types';

@Injectable()
export class MangaService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private get apiBase(): string {
    return this.config.get<string>(
      'MANGADEX_API_BASE',
      'https://api.mangadex.org',
    );
  }

  private get uploadsBase(): string {
    return this.config.get<string>(
      'MANGADEX_UPLOADS_BASE',
      'https://uploads.mangadex.org',
    );
  }

  private get httpTimeoutMs(): number {
    return this.config.get<number>('HTTP_TIMEOUT_MS', 5000);
  }

  private toSuffix(size: CoverSize): string {
    if (size === '256') return '.256.jpg';
    if (size === '512') return '.512.jpg';
    return '';
  }

  async getRandomCover(size: CoverSize = 'original'): Promise<CoverResult> {
    const url = `${this.apiBase}/manga/random?includes[]=cover_art`;

    let data: MangaDexManga;
    try {
      const res = await firstValueFrom(
        this.http.get<MangaDexResponse>(url, { timeout: this.httpTimeoutMs }),
      );
      data = res.data.data as MangaDexManga;
    } catch {
      throw new BadGatewayException('UPSTREAM_ERROR');
    }

    if (!data?.id) {
      throw new InternalServerErrorException('INVALID_UPSTREAM_RESPONSE');
    }

    const relationships = data.relationships || [];
    const coverRel = relationships.find((r) => r.type === 'cover_art');
    const fileName = coverRel?.attributes?.fileName;

    if (!fileName) {
      throw new NotFoundException('COVER_NOT_FOUND');
    }

    const suffix = this.toSuffix(size);
    const coverUrl = `${this.uploadsBase}/covers/${data.id}/${fileName}${suffix}`;

    return { mangaId: data.id, coverUrl, size };
  }
}
