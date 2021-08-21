import { RouteComponentProps } from '@reach/router';
import React from 'react';
import { HomeLayout } from './HomeLayout';

function Home(_props: RouteComponentProps) {
  return React.useMemo(() => {
    return <HomeLayout />;
  }, []);
}

export default Home;
