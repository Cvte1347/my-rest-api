import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string | number> = {
                MANGADEX_API_BASE: 'https://api.mangadex.org',
                MANGADEX_UPLOADS_BASE: 'https://uploads.mangadex.org',
                HTTP_TIMEOUT_MS: 5000,
                PORT: '3000',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('config', () => {
    it('should return config object', () => {
      const result = appController.getConfig();
      expect(result).toHaveProperty('apiBase');
      expect(result).toHaveProperty('uploadsBase');
      expect(result).toHaveProperty('timeout');
      expect(result).toHaveProperty('port');
    });
  });
});
