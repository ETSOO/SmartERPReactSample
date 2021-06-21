import React from 'react';
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { SmartApp } from './SmartApp';
import { Link } from '@reach/router';
import { UserAvatar } from '@etsoo/react';

export function UserMenu() {
  // App
  const app = SmartApp.instance;

  // Culture context
  const Context = app.userState.context;

  // User menu anchor
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement>();

  // User menu open or not
  const isMenuOpen = Boolean(anchorEl);

  // User menu
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(undefined);
  };

  // Sign out
  const handleSignout = () => {
    // Close menu
    setAnchorEl(undefined);

    // Sign out
    app.api
      .put<boolean>('User/Signout', undefined, {
        onError: (error) => {
          console.log(error);
          // Prevent further processing
          return false;
        }
      })
      .then((_result) => {
        // Clear
        app.userLogout();

        // Go to login page
        app.toLoginPage();
      });
  };

  return (
    <React.Fragment>
      <IconButton
        edge="end"
        aria-haspopup="true"
        onClick={handleUserMenuOpen}
        color="inherit"
      >
        <Context.Consumer>
          {(user) => (
            <UserAvatar title={user.state.name} src={user.state.avatar} />
          )}
        </Context.Consumer>
      </IconButton>
      <Menu
        disableScrollLock={true}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        open={isMenuOpen}
        onClick={handleMenuClose}
        onClose={handleMenuClose}
      >
        <MenuItem component={Link} to="/home/myprofile">
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{app.get('menuMyProfile')}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSignout}>
          <ListItemIcon>
            <ExitToAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{app.get('signout')}</ListItemText>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
