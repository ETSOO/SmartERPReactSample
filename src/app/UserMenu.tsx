import React from 'react';
import {
  Avatar,
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

export function UserMenu() {
  // App
  const app = SmartApp.instance;

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
      .then((result) => {
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
        aria-label="account of current user"
        aria-haspopup="true"
        onClick={handleUserMenuOpen}
        color="inherit"
      >
        <Avatar alt="肖赞" sx={{ width: 32, height: 32 }}>
          XZ
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
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
