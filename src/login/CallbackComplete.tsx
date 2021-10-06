import React from 'react';
import { Button, Typography } from '@mui/material';
import { Redirect, RouteComponentProps } from '@reach/router';
import { SmartApp } from '../app/SmartApp';
import { SharedLayout } from './SharedLayout';
import { TextFieldEx, TextFieldExMethods } from '@etsoo/react';
import { Helper } from '../app/Helper';
import { StorageUtils } from '@etsoo/shared';
import { IActionResult } from '@etsoo/appscript';
import { Constants } from '../app/Constants';
import { ResetPasswordRQ } from '../RQ/ResetPasswordRQ';

function CallbackComplete(props: RouteComponentProps<{ username: string }>) {
  // App
  const app = SmartApp.instance;

  // Labels
  const labels = app.getLabels(
    'passwordTip',
    'passwordRepeatError',
    'createPassword',
    'yourPassword',
    'repeatPassword',
    'submit'
  );

  // Destructure
  const { navigate } = props;

  // Refs
  const passwordRef = React.useRef<HTMLInputElement>();
  const passwordMethodRef = React.createRef<TextFieldExMethods>();

  const repeatRef = React.useRef<HTMLInputElement>();
  const repeatMethodRef = React.createRef<TextFieldExMethods>();

  // Destruct
  const { username } = props;

  const codeId = StorageUtils.getSessionData(Constants.CodeFieldCallback, '');

  if (username == null || codeId === '') {
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

  // Submit
  const submitClick = async () => {
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

    // Submit data
    const data: ResetPasswordRQ = {
      id,
      codeId,
      password: repeat.value,
      region: app.region
    };

    const result = await app.api.put<IActionResult>('Auth/ResetPassword', data);
    if (result == null) return;

    if (result.success) {
      // Clear the code
      StorageUtils.setSessionData(Constants.CodeFieldCallback, undefined);

      // Back to the login page
      navigate!(app.transformUrl(`/login/password/${username}`));
      return;
    }

    app.alertResult(result);
  };

  return (
    <SharedLayout
      title={labels.createPassword}
      subTitle={<Typography variant="subtitle2">{id}</Typography>}
      buttons={[
        <Button variant="contained" key="next" onClick={submitClick}>
          {labels.submit}
        </Button>
      ]}
      {...props}
    >
      <TextFieldEx
        label={labels.yourPassword}
        showPassword={true}
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
        showPassword={true}
        inputRef={repeatRef}
        ref={repeatMethodRef}
        onEnter={(e) => {
          submitClick();
          e.preventDefault();
        }}
      />
      <Typography variant="body2">* {labels.passwordTip}</Typography>
    </SharedLayout>
  );
}

export default CallbackComplete;
