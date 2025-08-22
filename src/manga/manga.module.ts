import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MangaController } from './manga.controller';
import { MangaService } from './manga.service';
import { MangadexParserController } from './mangadex-parser.controller';
import { MangadexParserService } from './mangadex-parser.service';

@Module({
  imports: [HttpModule],
  controllers: [MangaController, MangadexParserController],
  providers: [MangaService, MangadexParserService],
})
export class MangaModule {}
