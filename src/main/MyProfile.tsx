import { Container } from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';
import { SmartApp } from '../app/SmartApp';

function Dashboard(props: RouteComponentProps) {
  // App
  const app = SmartApp.instance;

  return (
    <Container>
      {app.get('menuMyProfile')}
      <br />
      {props.path}
    </Container>
  );
}

export default Dashboard;
