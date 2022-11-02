import { Logger, Module } from '@nestjs/common';
import { PubSubController } from './pub-sub.controller';
import { PubSub } from '@google-cloud/pubsub';
import { ConfigService } from '@nestjs/config';
import { PubSubService } from './pub-sub.service';

@Module({
  imports: [],
  controllers: [PubSubController],
  providers: [
    {
      provide: PubSub,
      useFactory: (configService: ConfigService): PubSub => {
        const pubSub = new PubSub({
          projectId: configService.get('PUBSUB_PROJECT_ID'),
        });

        Logger.debug('Google PubSub Initialized');

        return pubSub;
      },
      inject: [ConfigService],
    },
    PubSubService,
  ],
  exports: [PubSubService],
})
export class PubSubModule {}
