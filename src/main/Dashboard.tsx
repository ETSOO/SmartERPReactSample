import { RouteComponentProps } from '@reach/router';
import { DashboardView } from '../models/DashboardView';
import { SmartApp } from '../app/SmartApp';
import React from 'react';
import { Container, List, ListItem, ListItemText } from '@material-ui/core';
import { DeviceDto } from '../models/DeviceDto';
import { UserDetector } from '../app/UserDetector';

function Dashboard(_props: RouteComponentProps) {
  // App
  const app = SmartApp.instance;

  // Culture context
  const Context = app.userState.context;

  // devices
  const [devices, setDevices] = React.useState<DeviceDto[]>([]);

  // Load data
  const loadData = () => {
    app.api.get<DashboardView>('System/Dashboard').then((view) => {
      if (view == null) return;

      setDevices(view.devices);
    });
  };

  return (
    <React.Fragment>
      <UserDetector success={loadData} />
      <List>
        <ListItem>
          <Context.Consumer>
            {(user) => <ListItemText primary={user.state.name + ', welcome'} />}
          </Context.Consumer>
        </ListItem>
        {devices.map((device, _index, _devices) => (
          <ListItem key={device.id}>
            <ListItemText
              primary={device.name}
              secondary={app.formatDate(device.lastSuccessLoginDate, 'ds')}
            />
          </ListItem>
        ))}
      </List>
    </React.Fragment>
  );
}

export default Dashboard;
