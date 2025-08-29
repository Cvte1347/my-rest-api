import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayModule } from './gateways/gateway.module';
import { MangaModule } from './manga/manga.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    GatewayModule,
    MangaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        MANGADEX_API_BASE: Joi.string().uri().required(),
        MANGADEX_UPLOADS_BASE: Joi.string().uri().required(),
        HTTP_TIMEOUT_MS: Joi.number().integer().min(100).default(5000),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
