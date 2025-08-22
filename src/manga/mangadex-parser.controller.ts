import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { MangadexParserService } from './mangadex-parser.service';

@Controller('mangadex-parser')
export class MangadexParserController {
  constructor(private readonly parserService: MangadexParserService) {}

  @Get('random')
  async parseRandomManga() {
    return await this.parserService.parseRandomManga();
  }

  @Get('manga/:id')
  async parseMangaById(@Param('id') id: string) {
    return await this.parserService.parseMangaById(id);
  }

  @Post('popular')
  async parsePopularManga(@Query('limit') limit: number = 10) {
    return await this.parserService.parsePopularManga(limit);
  }

  @Get('all')
  async getAllManga() {
    return await this.parserService.getAllManga();
  }
}