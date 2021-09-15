import React from 'react';
import { TextFieldEx } from '@etsoo/react';
import { Button } from '@mui/material';
import { Link, RouteComponentProps } from '@reach/router';
import { SmartApp } from '../app/SmartApp';
import { SharedLayout } from './SharedLayout';
import { IActionResult } from '@etsoo/appscript';

function Register(props: RouteComponentProps<{ '*': string }>) {
  // App
  const app = SmartApp.instance;

  // Labels
  const labels = app.getLabels(
    'userFound',
    'register',
    'back',
    'nextStep',
    'loginId'
  );

  // Destructure
  const { navigate } = props;

  let username = props['*'];
  if (username) username = decodeURIComponent(username);

  // Login id field
  const loginRef = React.useRef<HTMLInputElement>();

  // Next button click
  const nextClick = async () => {
    // Input check
    const input = loginRef.current!;
    const id = input.value.trim();
    if (id == null || id === '') {
      input.focus();
      return;
    }

    // Get the result
    const data = {
      id,
      country: app.settings.currentCountry.id
    };

    const result = await app.api.get<IActionResult>('Auth/LoginId', data);

    if (result != null) {
      if (result.success) {
        // Account registered
        app.notifier.confirm(labels.userFound, undefined, (value) => {
          if (value) {
            navigate!(
              app.transformUrl('/login/password/' + encodeURIComponent(id))
            );
          } else {
            input.focus();
          }
        });
      } else {
        // Continue
        navigate!(
          app.transformUrl('/login/registerpassword/' + encodeURIComponent(id))
        );
      }
    }
  };

  return (
    <SharedLayout
      title={labels.register}
      buttons={[
        <Button
          variant="outlined"
          component={Link}
          key="back"
          to={app.transformUrl('/')}
        >
          {labels.back}
        </Button>,
        <Button variant="contained" key="next" onClick={nextClick}>
          {labels.nextStep}
        </Button>
      ]}
      {...props}
    >
      <TextFieldEx
        label={labels.loginId}
        inputRef={loginRef}
        autoFocus
        autoCorrect="off"
        autoCapitalize="none"
        inputProps={{ inputMode: 'email' }}
        showClear={true}
        defaultValue={username}
        onEnter={(e) => {
          nextClick();
          e.preventDefault();
        }}
      />
    </SharedLayout>
  );
}

export default Register;
