import React from 'react';
import { TextFieldEx } from '@etsoo/react';
import { Button, Typography } from '@mui/material';
import { Redirect, RouteComponentProps } from '@reach/router';
import { SmartApp } from '../app/SmartApp';
import { SharedLayout } from './SharedLayout';
import { StorageUtils } from '@etsoo/shared';
import { IActionResult } from '@etsoo/appscript';
import { Constants } from '../app/Constants';
import { RegisterRQ } from '../RQ/RegisterRQ';

function RegisterComplete(props: RouteComponentProps<{ username?: string }>) {
  // Destructure
  const { navigate, username } = props;

  // App
  const app = SmartApp.instance;

  // Labels
  var labels = app.getLabels('completeRegistration', 'submit', 'yourname');

  // Name field
  const nameRef = React.useRef<HTMLInputElement>();

  // Password
  const password = StorageUtils.getSessionData(
    Constants.FieldRegisterPassword,
    ''
  );

  // Code id
  const codeId = StorageUtils.getSessionData(Constants.CodeFieldRegister, '');

  if (username == null || password === '' || codeId === '') {
    return <Redirect to={app.transformUrl('/login/register')} />;
  }

  // Decode
  const id = decodeURIComponent(username);

  // Submit button click
  const submitClick = async () => {
    // Input check
    const input = nameRef.current!;
    const name = input.value.trim();
    if (name === '') {
      input.focus();
      return;
    }

    // Submit data
    const data: RegisterRQ = {
      id,
      codeId,
      password,
      name,
      region: app.region
    };

    const result = await app.api.post<IActionResult>('Auth/Register', data);
    if (result == null) return;

    if (result.success) {
      // Clear the password
      StorageUtils.setSessionData(Constants.FieldRegisterPassword, undefined);

      // Back to the login page
      navigate!(app.transformUrl(`/login/password/${username}`));
      return;
    }

    app.alertResult(result);
  };

  return (
    <SharedLayout
      title={labels.completeRegistration}
      subTitle={<Typography variant="subtitle2">{id}</Typography>}
      buttons={[
        <Button variant="contained" key="next" onClick={submitClick}>
          {labels.submit}
        </Button>
      ]}
      {...props}
    >
      <TextFieldEx
        label={labels.yourname}
        inputRef={nameRef}
        autoFocus
        autoCorrect="off"
        autoCapitalize="none"
        showClear={true}
        onEnter={(e) => {
          submitClick();
          e.preventDefault();
        }}
      />
    </SharedLayout>
  );
}

export default RegisterComplete;
