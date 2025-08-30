import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('config')
  getConfig() {
    return {
      apiBase: this.configService.get<string>('MANGADEX_API_BASE'),
      uploadsBase: this.configService.get<string>('MANGADEX_UPLOADS_BASE'),
      timeout: this.configService.get<number>('HTTP_TIMEOUT_MS'),
      port: this.configService.get<string>('PORT'),
    };
  }
}
