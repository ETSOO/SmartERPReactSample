import { PList } from '@etsoo/react';
import { Button } from '@mui/material';
import { Link, RouteComponentProps } from '@reach/router';
import { SmartApp } from '../app/SmartApp';
import { SharedLayout } from './SharedLayout';

function About(props: RouteComponentProps) {
  // App
  const app = SmartApp.instance;

  // Labels
  const labels = app.getLabels('about', 'back');

  return (
    <SharedLayout
      title={labels.about}
      buttons={
        <Button variant="contained" component={Link} to={app.transformUrl('/')}>
          {labels.back}
        </Button>
      }
      {...props}
    >
      <PList items={app.get<string[]>('aboutPage')} />
    </SharedLayout>
  );
}

export default About;
