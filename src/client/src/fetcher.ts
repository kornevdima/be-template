export const topicsSubscriptions = async (API_URL: string) => {
  return await (await fetch(`${API_URL}/pub-sub/topics-subscriptions`)).json();
};

export const pull = async (API_URL, subscription: string) => {
  return await (
    await fetch(`${API_URL}/pub-sub/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionName: subscription,
      }),
    })
  ).json();
};

export const push = async (API_URL, topic: string, data: string) => {
  return await (
    await fetch(`${API_URL}/pub-sub/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topicName: topic,
        ...JSON.parse(data),
      }),
    })
  ).json();
};
