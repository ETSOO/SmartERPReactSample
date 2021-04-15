import React from 'react';
import { LanguageChooser } from '@etsoo/react';
import { DataTypes } from '@etsoo/shared';
import { Button, Link, TextField } from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';
import { SmartApp } from './app/SmartApp';
import { SharedLayout } from './login/SharedLayout';

function App(props: RouteComponentProps) {
  // Destruct
  const { navigate } = props;

  // App
  const app = SmartApp.instance;

  // Culture context
  const Context = SmartApp.cultureState.context;

  // Culture dispatch
  const { dispatch } = React.useContext(Context);

  // Change culture
  const closeCultureChoose = (item: DataTypes.CultureDefinition) => {
    if (item != null) {
      app.changeCultureEx(dispatch, item);
    }
  };

  // Login id field
  const loginRef = React.useRef<HTMLInputElement>();

  // Login id error
  const [loginIdError, updateLoginIdError] = React.useState<string>();

  // Next button click
  const nextClick = async () => {
    // Input check
    const id = loginRef.current?.value.trim();
    if (id == null || id === '') {
      loginRef.current?.focus();
      return;
    }

    // Get the result
    const result = await app.api.get<boolean>(`Auth/LoginId/${id}`);

    if (result != null) {
      if (!result) {
        updateLoginIdError(app.get<string>('userNotFound'));
        loginRef.current?.focus();
      } else {
        updateLoginIdError(undefined);
        navigate!('login/password/' + encodeURIComponent(id));
      }
    }
  };

  return (
    <Context.Consumer>
      {(value) => (
        <SharedLayout
          headerRight={
            <LanguageChooser
              items={app.settings.cultures}
              title={value.get('languages')}
              onClose={closeCultureChoose}
              selectedValue={app.settings.currentCulture.name}
            />
          }
          title={value.get('login')!}
          buttons={[
            <Button variant="contained" key="next" onClick={nextClick}>
              {value.get('nextStep')}
            </Button>
          ]}
          bottom={[
            <Link href="login/about" key="about">
              {value.get('about')}
            </Link>,
            <Link href="login/terms" key="terms">
              {value.get('terms')}
            </Link>,
            <div key="version">{process.env.REACT_APP_VERSION}</div>
          ]}
          {...props}
        >
          <TextField
            label={value.get('loginId')}
            variant="standard"
            fullWidth
            inputRef={loginRef}
            onChange={() => updateLoginIdError(undefined)}
            error={loginIdError != null}
            helperText={loginIdError}
            autoCorrect="off"
            autoCapitalize="none"
            inputProps={{ inputMode: 'email' }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                nextClick();
                e.preventDefault();
              }
            }}
          />
          <div>
            {value.get('noAccountTip')}&nbsp;
            <Link href="login/register">{value.get('noAccountCreate')}</Link>
          </div>
        </SharedLayout>
      )}
    </Context.Consumer>
  );
}

export default App;
