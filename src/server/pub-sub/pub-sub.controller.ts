import { Body, Controller, Get, Post } from '@nestjs/common';
import { PubSubService } from './pub-sub.service';

@Controller('pub-sub')
export class PubSubController {
  constructor(private readonly pubSubService: PubSubService) {}

  @Post('publish')
  async publish(
    @Body()
    publishDto: {
      topicName: string;
      data: Record<string, string>;
      attributes?: Record<string, string>;
    },
  ): Promise<string> {
    return this.pubSubService.publish(
      publishDto.topicName,
      publishDto.data,
      publishDto.attributes,
    );
  }

  @Post('pull')
  async pull(@Body() pullDto: { subscriptionName: string }): Promise<any> {
    return this.pubSubService.pull(pullDto.subscriptionName);
  }

  @Get('topics')
  async getAllTopics(): Promise<string[]> {
    return this.pubSubService.getAllTopicsNames();
  }

  @Get('subscriptions')
  async getAllSubscriptions(): Promise<string[]> {
    return this.pubSubService.getAllSubscriptionsNames();
  }

  @Get('topics-subscriptions')
  async getTopicSubscriptionsMap(): Promise<Record<string, any>> {
    return this.pubSubService.getTopicSubscriptionMap();
  }

  @Post('topics')
  async createTopic(
    @Body() createTopicDto: { topicName: string },
  ): Promise<string> {
    return (await this.pubSubService.createTopic(createTopicDto.topicName))
      .name;
  }

  @Post('subscriptions')
  async createSubscriptions(
    @Body()
    createSubscriptionDto: {
      topicName: string;
      subscriptionName: string;
    },
  ): Promise<string> {
    return (
      await this.pubSubService.createSubscription({
        topicName: createSubscriptionDto.topicName,
        subscriptionName: createSubscriptionDto.subscriptionName,
      })
    ).name;
  }

  @Post('seed')
  async seed(): Promise<string> {
    await this.pubSubService.seed();

    return 'All topics and subscriptions re-created';
  }
}
