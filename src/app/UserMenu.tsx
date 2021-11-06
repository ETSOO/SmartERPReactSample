import React from 'react';
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import { SmartApp } from './SmartApp';
import { Link } from '@reach/router';
import { UserAvatar } from '@etsoo/react';

export function UserMenu() {
  // App
  const app = SmartApp.instance;

  // User context
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
    app.signout();
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
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: -0.4,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0
            }
          }
        }}
        disableScrollLock
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
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
        <MenuItem component={Link} to="/home/user/updateavatar">
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{app.get('updateAvatar')}</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to="/home/user/changepassword">
          <ListItemIcon>
            <LockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{app.get('changePassword')}</ListItemText>
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
