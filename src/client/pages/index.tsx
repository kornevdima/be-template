import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { Container, SelectChangeEvent, Alert, Snackbar } from '@mui/material';

import { topicsSubscriptions, pull, push } from '../src/fetcher';
import Editor from '../components/monaco/editor';
import PushSelector from '../components/pushSelector/pushSelector';
import PullSelector from '../components/pullSelector/pullSelector';

export async function getServerSideProps(context) {
  return {
    props: {
      topicsSubscriptionMap: await topicsSubscriptions(context.query.API_HOST),
    },
  };
}

const Index: NextPage<{
  topicsSubscriptionMap: Record<string, string[]>;
}> = ({ topicsSubscriptionMap }) => {
  const topics = Object.keys(topicsSubscriptionMap);

  const [topic, setTopic] = React.useState('');

  const { query } = useRouter();
  const API_HOST = query.API_HOST;
  const defaultValue = `{
  "data": {},
  "attributes": {}
}`;

  const [messageId, setMessageId] = React.useState('');
  const [subscriptions, setSubscriptions] = React.useState([]);
  const [subscription, setSubscription] = React.useState('');
  const [pushData, setPushData] = React.useState(defaultValue);
  const [pullData, setPullData] = React.useState('');

  const onTopicSelect = ({ target }: SelectChangeEvent) => {
    const { value } = target;
    setTopic(value);
  };

  React.useEffect(() => {
    if (topic !== '') {
      setSubscriptions(topicsSubscriptionMap[topic]);
      setSubscription('');
    } else {
      resetSubscriptions();
    }
  }, [topic]);

  const onPush = React.useCallback(async () => {
    if (topic === '') {
      return;
    }

    const res = await push(API_HOST, topic, pushData);
    setMessageId(res);
    setOpen(true);
  }, null);

  const onPull = React.useCallback(async () => {
    const res = await pull(query.API_HOST, subscription);

    setPullData(JSON.stringify(res));
  }, null);

  const [open, setOpen] = React.useState(false);

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const resetSubscriptions = React.useCallback(() => {
    setSubscription('');
    setSubscriptions([]);
  }, [subscription, setSubscriptions]);

  const onSubscriptionSelect = ({ target }: SelectChangeEvent) => {
    setSubscription(target.value);
  };

  return (
    <Grid container disableEqualOverflow>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Message {messageId} published!
        </Alert>
      </Snackbar>

      <Grid xs={6}>
        <PushSelector
          onPush={onPush}
          onSelect={onTopicSelect}
          topics={topics}
          topic={topic}
        />
      </Grid>

      <Grid xs={6}>
        <PullSelector
          subscriptions={subscriptions}
          subscription={subscription}
          onSelect={onSubscriptionSelect}
          onPull={onPull}
        />
      </Grid>

      <Grid xs={12} container>
        <Grid xs={6}>
          <Container>
            <Editor onChange={setPushData} value={pushData} />
          </Container>
        </Grid>

        <Grid xs={6}>
          <Container>
            <Editor value={pullData} />
          </Container>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Index;
