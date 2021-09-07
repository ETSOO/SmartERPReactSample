import React from 'react';
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import { SmartApp } from './SmartApp';
import { Link } from '@reach/router';

/**
 * Drawer menu
 * @returns Menu
 */
export function DrawerMenu() {
  // App
  const app = SmartApp.instance;

  // Open state
  const [open, setOpen] = React.useState(false);

  // Click handler
  const toggleDrawer = () => {
    setOpen(!open);
  };

  // Close handler
  const closeHandler = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="open drawer"
        sx={{ mr: 2 }}
        onClick={toggleDrawer}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="left"
        open={open}
        onClose={closeHandler}
        onClick={closeHandler}
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
      >
        <List>
          <ListItem button component={Link} to="/home/">
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary={app.get('menuHome')} />
          </ListItem>
          <ListItem button component={Link} to="/home/loginhistory">
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText primary={app.get('menuLoginHistory')} />
          </ListItem>
        </List>
      </Drawer>
    </React.Fragment>
  );
}
