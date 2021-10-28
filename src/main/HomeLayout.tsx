import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { Link, Router } from '@reach/router';
import { SmartApp } from '../app/SmartApp';
import { UserMenu } from '../app/UserMenu';
import Dashboard from './Dashboard';
import React, { CSSProperties } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

// Lazy load components
const LoginHistory = React.lazy(() => import('./user/LoginHistory'));
const UpdateAvatar = React.lazy(() => import('./user/UpdateAvatar'));
const ChangePassword = React.lazy(() => import('./user/ChangePassword'));

const drawerWidth = 220;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  [theme.breakpoints.up('md')]: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      }),
      marginLeft: 0
    })
  }
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open'
})<AppBarProps>(({ theme, open }) => ({
  [theme.breakpoints.up('md')]: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      })
    })
  }
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  // necessary for content to be below app bar
  ...(theme.mixins.toolbar as CSSProperties),
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1, 0, 2.5),
  justifyContent: 'space-between'
}));

export function HomeLayout() {
  // App
  const app = SmartApp.instance;

  // Labels
  const labels = app.getLabels(
    'smartERP',
    'hideMenu',
    'menuHome',
    'menuLoginHistory'
  );

  // Page context
  const PageContext = SmartApp.pageState.context;

  // Theme and screen size
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  // Menu open/close state
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    setOpen(mdUp);
  }, [mdUp]);

  return (
    <React.Fragment>
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
            onClick={handleDrawerOpen}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            <PageContext.Consumer>
              {(page) => page.state.title}
            </PageContext.Consumer>
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <UserMenu />
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex' }}>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box'
            }
          }}
          anchor="left"
          variant={mdUp ? 'persistent' : 'temporary'}
          open={open}
          onClose={mdUp ? undefined : handleDrawerClose}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
        >
          <DrawerHeader>
            <Typography variant="h6" noWrap component="div">
              {labels.smartERP}
            </Typography>
            <IconButton title={labels.hideMenu} onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List onClick={mdUp ? undefined : handleDrawerClose}>
            <ListItem button component={Link} to="/home/">
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary={labels.menuHome} />
            </ListItem>
            <ListItem button component={Link} to="/home/user/loginhistory">
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary={labels.menuLoginHistory} />
            </ListItem>
          </List>
        </Drawer>
        <Main open={open}>
          <DrawerHeader />
          <Router primary={false}>
            <Dashboard path="/" default />
            <LoginHistory path="user/loginhistory" />
            <UpdateAvatar path="user/updateavatar" />
            <ChangePassword path="user/changepassword" />
          </Router>
        </Main>
      </Box>
    </React.Fragment>
  );
}
