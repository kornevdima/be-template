import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  PORT;

  @IsString()
  PUBSUB_PROJECT_ID;

  @IsString()
  PUBSUB_EMULATOR_HOST;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}

export const configuration = () => ({
  PORT: process.env.PORT,
  PUBSUB_PROJECT_ID: process.env.PUBSUB_PROJECT_ID,
  PUBSUB_EMULATOR_HOST: process.env.PUBSUB_EMULATOR_HOST,
  DEAD_LETTER_MAP: {
    topicName: null, // Replace if retry policy should be enabled
    subscriptionName: null,
  },
  /* Topics/Subscriptions map */
  TOPICS_SUBSCRIPTIONS: [
    {
      topicName: process.env.TEST_TOPIC,
      subscriptionName: process.env.TEST_SUBSCRIPTION,
    },
  ],
});
