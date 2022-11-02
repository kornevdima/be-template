import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import {
  CreateSubscriptionOptions,
  PubSub,
  Subscription,
  Topic,
  v1,
} from '@google-cloud/pubsub';
import { ConfigService } from '@nestjs/config';
import { isNil } from 'lodash';

@Injectable()
export class PubSubService implements OnApplicationShutdown, OnModuleInit {
  constructor(
    private readonly pubSub: PubSub,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  async onApplicationShutdown(signal?: string): Promise<any> {
    Logger.verbose(`Shutdown signal received: ${signal}`);

    await this.removeAllTopics();
  }

  async seed() {
    try {
      if (await this.isTopicsCreated()) {
        await this.removeAllTopics();
      }

      await this.createTopicsAndSubscriptions();
    } catch (e) {
      Logger.error(e, e.stack);
    }
  }

  async getAllTopicsNames(): Promise<string[]> {
    const [topics] = await this.pubSub.getTopics();

    return this.getNamesFromEntityList(topics);
  }

  async getAllSubscriptionsNames(): Promise<string[]> {
    const [subscriptions] = await this.pubSub.getSubscriptions();

    return this.getNamesFromEntityList(subscriptions);
  }

  async isTopicsCreated(): Promise<boolean> {
    return (await this.getAllTopicsNames()).length > 0;
  }

  async getTopicSubscriptionMap(): Promise<Record<string, any>> {
    const [topics] = await this.pubSub.getTopics();
    const res: Record<string, string[]> = {};

    for (const topicsKey in topics) {
      res[this.formatEntityName(topics[topicsKey].name)] =
        this.getNamesFromEntityList(
          (await topics[topicsKey].getSubscriptions())[0],
        );
    }

    return res;
  }

  async createTopic(topicName: string): Promise<Topic> {
    const [topic] = await this.pubSub.createTopic(topicName);

    Logger.debug(`Topic ${topic.name} created.`);

    return topic;
  }

  async createSubscription({
    topicName,
    subscriptionName,
    deadLetterTopic,
    options = {},
  }: {
    topicName: string;
    subscriptionName: string;
    deadLetterTopic?: string;
    options?: CreateSubscriptionOptions;
  }): Promise<Subscription> {
    const subscriptionOptions: CreateSubscriptionOptions = options;

    if (deadLetterTopic) {
      subscriptionOptions.deadLetterPolicy = {
        ...subscriptionOptions.deadLetterPolicy,
        deadLetterTopic: deadLetterTopic,
        maxDeliveryAttempts: 20, // Doesn't count attempts: https://googlecloudplatform.uservoice.com/forums/302631-cloud-pub-sub/suggestions/18698734-add-retry-count-to-pub-sub
      };
    }

    const [subscription] = await this.pubSub
      .topic(topicName)
      .createSubscription(subscriptionName, subscriptionOptions);

    Logger.debug(`Subscription ${subscription.name} created.`);

    return subscription;
  }

  async publish(topicName, data, attributes = {}) {
    const messageId = await this.pubSub.topic(topicName).publishMessage({
      json: data,
      attributes,
    });

    Logger.debug(`Message published!: ${messageId}`);

    return messageId;
  }

  async pull(subscriptionName) {
    const pubSubOptions = await this.pubSub.getClientConfig();

    const options = {
      projectId: pubSubOptions.projectId,
      port: +pubSubOptions.port,
      servicePath: pubSubOptions.servicePath,
      sslCreds: pubSubOptions.sslCreds,
    };

    const subClient = new v1.SubscriberClient(options);

    const formattedSubscription = subClient.subscriptionPath(
      pubSubOptions.projectId,
      subscriptionName,
    );

    const request = {
      subscription: formattedSubscription,
      maxMessages: 10,
      timeout: 30,
    };

    const [response] = await subClient.pull(request);

    if (response.receivedMessages.length) {
      const ackIds = [];
      const data = [];
      for (const receivedMessage of response.receivedMessages) {
        data.push({
          data: JSON.parse(receivedMessage.message.data.toString()),
          attributes: receivedMessage.message.attributes,
        });
        ackIds.push(receivedMessage.ackId);
      }

      const ackRequest = {
        subscription: formattedSubscription,
        ackIds,
      };

      await subClient.acknowledge(ackRequest);
      return data;
    } else {
      return [];
    }
  }

  private async createTopicsAndSubscriptions(): Promise<string> {
    const topicSubscriptions = this.configService.get('TOPICS_SUBSCRIPTIONS');

    const deadLetterTopicName =
      await this.createDeadLetterTopicAndSubscription();

    for (const topicSubscriptionsKey in topicSubscriptions) {
      if (
        isNil(topicSubscriptions[topicSubscriptionsKey].topicName) ||
        isNil(topicSubscriptions[topicSubscriptionsKey].subscriptionName)
      ) {
        return;
      }

      await this.createTopic(
        topicSubscriptions[topicSubscriptionsKey].topicName,
      );
      await this.createSubscription({
        topicName: topicSubscriptions[topicSubscriptionsKey].topicName,
        subscriptionName:
          topicSubscriptions[topicSubscriptionsKey].subscriptionName,
        deadLetterTopic: deadLetterTopicName,
      });
    }

    return 'OK';
  }

  private async createDeadLetterTopicAndSubscription(): Promise<string> {
    const deadLetter = this.configService.get('DEAD_LETTER_MAP');

    if (isNil(deadLetter.topicName) && isNil(deadLetter.subscriptionName)) {
      return;
    }

    const [deadLetterSubscription] = await (
      await this.createTopic(deadLetter.topicName)
    ).createSubscription(deadLetter.subscriptionName);

    Logger.debug(`Subscription ${deadLetterSubscription.name} created.`);

    return deadLetterSubscription.metadata.topic;
  }

  private getNamesFromEntityList(entities: Topic[] | Subscription[]): string[] {
    return entities.map((entity: Subscription | Topic) => {
      return this.formatEntityName(entity.name);
    });
  }

  private formatEntityName(string): string {
    return string.split('/').pop();
  }

  private async removeAllTopics() {
    try {
      const [topics] = await this.pubSub.getTopics();
      const [subscriptions] = await this.pubSub.getSubscriptions();

      for (const topicsKey in topics) {
        await topics[topicsKey].delete();
        Logger.debug(`Topic ${topicsKey} deleted`);
      }

      for (const subscriptionsKey in subscriptions) {
        await subscriptions[subscriptionsKey].delete();
        Logger.debug(`Subscription ${subscriptionsKey} deleted`);
      }
    } catch (e) {
      Logger.error(e, e.stack);
    }
  }
}
