import React from 'react';

import Selector from '../selector/selector';

export default function PullSelector({
  subscription,
  subscriptions,
  onSelect,
  onPull,
}) {
  return (
    <Selector
      value={subscription}
      values={subscriptions}
      onChange={onSelect}
      onClick={onPull}
      btnText="Pull"
      id="select-subscription"
      label="Select subscription"
    />
  );
}
