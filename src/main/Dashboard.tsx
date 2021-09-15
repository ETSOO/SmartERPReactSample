import { RouteComponentProps } from '@reach/router';
import { DashboardView } from '../models/DashboardView';
import { SmartApp } from '../app/SmartApp';
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { DeviceDto } from '../models/DeviceDto';
import { CommonPage } from '@etsoo/react';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

function Dashboard(props: RouteComponentProps) {
  // App
  const app = SmartApp.instance;

  // Labels
  const labels = app.getLabels('more');

  // User context
  const Context = app.userState.context;

  // devices
  const [devices, setDevices] = React.useState<DeviceDto[]>([]);

  // Load data
  const reloadData = async () => {
    const view = await app.api.get<DashboardView>('System/Dashboard');
    if (view == null) return;
    setDevices(view.devices);
  };

  // Load more history
  const loadMoreHistory = () => {
    props.navigate!(app.transformUrl('/home/user/loginhistory'));
  };

  React.useEffect(() => {
    // Page title
    app.setPageKey('menuHome');
  }, [app]);

  return (
    <CommonPage onUpdate={reloadData}>
      <Card>
        <Context.Consumer>
          {(user) => (
            <CardHeader
              title={user.state.name + ', welcome'}
              action={
                <IconButton title={labels.more} onClick={loadMoreHistory}>
                  <MoreHorizIcon />
                </IconButton>
              }
            />
          )}
        </Context.Consumer>
        <CardContent sx={{ paddingTop: 0 }}>
          <List disablePadding dense>
            {devices.map((device, _index, _devices) => (
              <ListItem key={device.id} disableGutters disablePadding>
                <ListItemText
                  primary={device.name}
                  secondary={app.formatDate(device.lastSuccessLoginDate, 'ds')}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </CommonPage>
  );
}

export default Dashboard;
