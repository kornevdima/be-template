PubSub Client

The UI for publishing/pulling messages for [Google Pubsub Emulator](https://cloud.google.com/pubsub/docs/emulator)

Nest.js back-end application on init creates topics and subscriptions.
Client application using SSR Next and React.

Configuration should be done in config folder.

Application provides simple rest api for testing purposes.
In general, it's not expected to publish anything using HTTP clients.
Use provided UI at the / path. Pulling messages will fetch 10 messages and ack them.
Other option is press pull and publish message to the topic. This message will be fetched immediately.
