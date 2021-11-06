import React from 'react';
import { Button, Typography } from '@mui/material';
import { Link, Redirect, RouteComponentProps } from '@reach/router';
import { SmartApp } from '../app/SmartApp';
import { SharedLayout } from './SharedLayout';
import { TextFieldEx, TextFieldExMethods } from '@etsoo/react';
import { Helper } from '../app/Helper';
import { StorageUtils } from '@etsoo/shared';
import { Constants } from '../app/Constants';

function RegisterPassword(props: RouteComponentProps<{ username: string }>) {
  // Destructure
  const { navigate } = props;

  // App
  const app = SmartApp.instance;

  // Labels
  const labels = app.getLabels(
    'passwordTip',
    'passwordRepeatError',
    'createPassword',
    'back',
    'nextStep',
    'yourPassword',
    'repeatPassword'
  );

  // Refs
  const passwordRef = React.useRef<HTMLInputElement>();
  const passwordMethodRef = React.createRef<TextFieldExMethods>();

  const repeatRef = React.useRef<HTMLInputElement>();
  const repeatMethodRef = React.createRef<TextFieldExMethods>();

  // Destruct
  const { username } = props;

  if (username == null) {
    return <Redirect to={app.transformUrl('/')} />;
  }

  // Decode
  const id = decodeURIComponent(username);

  // Repeat step
  const repeatStep = (check: boolean = false) => {
    const password = passwordRef.current!;
    if (password.value === '') {
      password.focus();
      return false;
    }

    if (!Helper.isValidPassword(password.value)) {
      passwordMethodRef.current?.setError(labels.passwordTip);
      password.focus();
      return false;
    }

    if (!check) repeatRef.current?.focus();

    return true;
  };

  // Next
  const nextClick = () => {
    if (!repeatStep(true)) {
      return;
    }

    const repeat = repeatRef.current!;
    if (repeat.value === '') {
      repeat.focus();
      return;
    }

    if (repeat.value !== passwordRef.current?.value) {
      repeatMethodRef.current?.setError(labels.passwordRepeatError);
      return;
    }

    // Hold the password
    StorageUtils.setSessionData(Constants.FieldRegisterPassword, repeat.value);

    // Continue
    navigate!(
      app.transformUrl('/login/registerverify/' + encodeURIComponent(id))
    );
  };

  return (
    <SharedLayout
      title={labels.createPassword}
      subTitle={id}
      buttons={[
        <Button
          variant="outlined"
          component={Link}
          key="back"
          to={app.transformUrl('/login/register')}
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
        label={labels.yourPassword}
        showPassword
        autoComplete="new-password"
        autoFocus
        inputRef={passwordRef}
        ref={passwordMethodRef}
        onEnter={(e) => {
          repeatStep();
          e.preventDefault();
        }}
      />
      <TextFieldEx
        label={labels.repeatPassword}
        showPassword
        inputRef={repeatRef}
        ref={repeatMethodRef}
        onEnter={(e) => {
          nextClick();
          e.preventDefault();
        }}
      />
      <Typography variant="caption">* {labels.passwordTip}</Typography>
    </SharedLayout>
  );
}

export default RegisterPassword;
