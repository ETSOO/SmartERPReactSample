import React from 'react';
import {
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Link
} from '@material-ui/core';
import { Redirect, RouteComponentProps } from '@reach/router';
import { SmartApp } from '../app/SmartApp';
import { SharedLayout } from './SharedLayout';
import { IActionResult } from '@etsoo/appscript';

type PasswordProps = RouteComponentProps<{ username: string }>;

function Password(props: PasswordProps) {
  // App
  const app = SmartApp.instance;

  // Password ref
  const passwordRef = React.useRef<HTMLInputElement>();

  // Submit button
  const buttonRef = React.useRef<HTMLInputElement>();

  // Login id error
  const [loginError, updateLoginError] = React.useState<string>();

  // Keep or not
  const [keep, updateKeep] = React.useState<boolean>();

  // Destruct
  const { username } = props;

  if (username == null) {
    return <Redirect to={app.transformUrl('/')} />;
  }

  // Decode
  const id = decodeURIComponent(username);

  // Submit
  const submit = async () => {
    // password
    const password = passwordRef.current?.value.trim();
    if (password == null || password.length < 4) {
      passwordRef.current?.focus();
      return;
    }

    // Model
    const data = {
      id,
      pwd: password
    };

    const result = await app.api.post<IActionResult>('Auth/Login', data);

    if (result != null) {
      if (result.success) {
      } else {
        updateLoginError(result.title);

        if (result.type === 'UserFrozen') {
        } else {
          passwordRef.current?.focus();
        }
      }
    }
  };

  return (
    <SharedLayout
      title={id}
      buttons={
        <Button variant="contained" onClick={submit} innerRef={buttonRef}>
          {app.get('submit')}
        </Button>
      }
      {...props}
    >
      <TextField
        label={app.get('yourPassword')}
        variant="standard"
        type="password"
        inputRef={passwordRef}
        error={loginError != null}
        helperText={loginError}
        fullWidth
        autoFocus
        onChange={() => updateLoginError(undefined)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            submit();
            e.preventDefault();
          }
        }}
      />
      <FormControlLabel
        control={<Switch onChange={(e, checked) => updateKeep(checked)} />}
        label={app.get('keepLogged')}
      />
      <div>
        <Link href="">{app.get('forgotPasswordTip')}</Link>
      </div>
    </SharedLayout>
  );
}

export default Password;
