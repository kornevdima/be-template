import React from 'react';

import Selector from '../selector/selector';

export default function PushSelector({ onPush, onSelect, topic, topics }) {
  return (
    <Selector
      value={topic}
      values={topics}
      onChange={onSelect}
      onClick={onPush}
      btnText="Push"
      id="select-topic"
      label="Select topic"
    />
  );
}
