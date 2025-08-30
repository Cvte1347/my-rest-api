// src/manga/manga.controller.ts
import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { MangaService } from './manga.service';
import type { CoverSize } from './types';

@ApiTags('covers')
@Controller('manga')
export class MangaController {
  constructor(private readonly manga: MangaService) {}

  @Get('random-cover')
  @ApiOperation({ summary: 'Получить случайную обложку манги' })
  @ApiQuery({
    name: 'size',
    enum: ['original', '256', '512'],
    required: false,
    description: 'Размер обложки',
  })
  @ApiResponse({
    status: 200,
    description: 'Обложка успешно получена',
    schema: {
      type: 'object',
      properties: {
        mangaId: {
          type: 'string',
          example: '12345',
        },
        coverUrl: {
          type: 'string',
          example: 'https://uploads.mangadex.org/covers/12345/cover.jpg',
        },
        size: {
          type: 'string',
          enum: ['original', '256', '512'],
          example: 'original',
        },
      },
    },
  })
  async randomCover(@Query('size') size: CoverSize = 'original') {
    return this.manga.getRandomCover(size);
  }

  @Get('random-cover.jpg')
  @Header('Cache-Control', 'no-cache')
  @ApiOperation({ summary: 'Получить случайную обложку манги с редиректом' })
  @ApiQuery({
    name: 'size',
    enum: ['original', '256', '512'],
    required: false,
    description: 'Размер обложки',
  })
  @ApiResponse({
    status: 302,
    description: 'Редирект на изображение обложки',
  })
  async randomCoverRedirect(
    @Res() res: Response,
    @Query('size') size: CoverSize = 'original',
  ) {
    const { coverUrl } = await this.manga.getRandomCover(size);
    return res.redirect(302, coverUrl);
  }
}
