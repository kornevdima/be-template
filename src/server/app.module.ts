import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PubSubModule } from './pub-sub/pub-sub.module';
import { configuration, validate } from './config';
import { ViewModule } from './view/view.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    PubSubModule,
    ViewModule,
  ],
})
export class AppModule {}
