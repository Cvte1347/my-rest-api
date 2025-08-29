// src/manga/manga.controller.ts
import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { MangaService } from './manga.service';

type CoverSize = 'original' | '256' | '512';

@Controller('manga')
export class MangaController {
  constructor(private readonly manga: MangaService) {}

  @Get('random-cover')
  async randomCover(@Query('size') size: CoverSize = 'original') {
    return this.manga.getRandomCover(size);
  }

  @Get('random-cover.jpg')
  @Header('Cache-Control', 'no-cache')
  async randomCoverRedirect(
    @Res() res: Response,
    @Query('size') size: CoverSize = 'original',
  ) {
    const { coverUrl } = await this.manga.getRandomCover(size);
    return res.redirect(302, coverUrl);
  }
}
