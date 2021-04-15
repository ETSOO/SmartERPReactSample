import { Button } from '@material-ui/core';
import { Link, RouteComponentProps } from '@reach/router';
import { SmartApp } from '../app/SmartApp';
import { SharedLayout } from './SharedLayout';

function Register(props: RouteComponentProps) {
  return (
    <SharedLayout
      title="注册"
      buttons={
        <Button
          variant="contained"
          component={Link}
          to={SmartApp.instance.transformUrl('/')}
        >
          后退
        </Button>
      }
      {...props}
    ></SharedLayout>
  );
}

export default Register;
