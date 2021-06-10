import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { RouteComponentProps } from '@reach/router';
import { SmartApp } from '../app/SmartApp';
import { DashboardView } from '../models/DashboardView';
import { ISmartUser } from '../app/SmartUser';
import { UserDetector } from '../app/UserDetector';
import { UserMenu } from '../app/UserMenu';

function Home(_props: RouteComponentProps) {
  // App
  const app = SmartApp.instance;

  // Load data
  const loadData = (state: ISmartUser) => {
    app.api.get<DashboardView>('System/Dashboard').then((view) => {
      if (view == null) return;

      console.log(view);
    });
  };

  return (
    <AppBar>
      <UserDetector success={loadData} />
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          SmartERP
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <UserMenu />
      </Toolbar>
    </AppBar>
  );
}

export default Home;
