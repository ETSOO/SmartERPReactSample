import { AppBar, Box, Toolbar, Typography } from '@material-ui/core';
import { RouteComponentProps, Router } from '@reach/router';
import { SmartApp } from '../app/SmartApp';
import { UserMenu } from '../app/UserMenu';
import { DrawerMenu } from '../app/DrawerMenu';
import Dashboard from './Dashboard';
import React from 'react';

// Lazy load components
const LoginHistory = React.lazy(() => import('./LoginHistory'));
const MyProfile = React.lazy(() => import('./MyProfile'));

function Home(_props: RouteComponentProps) {
  // App
  const app = SmartApp.instance;

  // Header
  const Header = React.useMemo(() => {
    return (
      <React.Fragment>
        <AppBar>
          <Toolbar>
            <DrawerMenu />
            <Typography variant="h6" noWrap component="div">
              {app.get('smartERP')}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <UserMenu />
          </Toolbar>
        </AppBar>
        <Toolbar />
      </React.Fragment>
    );
  }, [app]);

  return (
    <React.Fragment>
      {Header}
      <Box component="main">
        <Router primary={false}>
          <Dashboard path="/" default />
          <LoginHistory path="/loginhistory" />
          <MyProfile path="/myprofile" />
        </Router>
      </Box>
    </React.Fragment>
  );
}

export default Home;
