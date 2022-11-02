import React from 'react';

export const PullContext = React.createContext({
  data: [],
  storeData: () => {},
});
