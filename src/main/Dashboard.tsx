import { RouteComponentProps } from '@reach/router';
import { DashboardView } from '../models/DashboardView';
import { SmartApp } from '../app/SmartApp';
import React from 'react';
import { List, ListItem, ListItemText } from '@material-ui/core';
import { DeviceDto } from '../models/DeviceDto';
import { UserDetector } from '../app/UserDetector';
import { CommonPage } from '@etsoo/react';

function Dashboard(_props: RouteComponentProps) {
  // App
  const app = SmartApp.instance;

  // Culture context
  const Context = app.userState.context;

  // devices
  const [devices, setDevices] = React.useState<DeviceDto[]>([]);

  // Load data
  const loadData = async () => {
    const view = await app.api.get<DashboardView>('System/Dashboard');
    if (view == null) return;
    setDevices(view.devices);
  };

  return (
    <CommonPage onRefresh={loadData}>
      <UserDetector success={loadData} />
      <List disablePadding={true}>
        <ListItem>
          <Context.Consumer>
            {(user) => <ListItemText primary={user.state.name + ', welcome'} />}
          </Context.Consumer>
        </ListItem>
        {devices.map((device, _index, _devices) => (
          <ListItem key={device.id} disableGutters={true}>
            <ListItemText
              primary={device.name}
              secondary={app.formatDate(device.lastSuccessLoginDate, 'ds')}
            />
          </ListItem>
        ))}
      </List>
    </CommonPage>
  );
}

export default Dashboard;
