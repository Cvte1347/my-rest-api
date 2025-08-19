import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MangaService } from './manga.service';
import { MangaController } from './manga.controller';

@Module({
    imports: [HttpModule.register({ timeout: 5000 })],
  providers: [MangaService],
  controllers: [MangaController],
  exports: [MangaService],
})
export class MangaModule {}
