import { Container, styled, Typography } from '@mui/material';
import React from 'react';

export default function Layout({ children }) {
  const Header = styled('header')`
    padding-bottom: 10px;
  `;
  return (
    <>
      <Header>
        <Container>
          <Typography variant={'h4'} align="center">
            Local PubSub Emulator
          </Typography>
        </Container>
      </Header>
      <main>{children}</main>
    </>
  );
}
