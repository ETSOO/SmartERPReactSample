import React from 'react';
import {
  HBox,
  LanguageChooser,
  TextFieldEx,
  TextFieldExMethods
} from '@etsoo/react';
import { DataTypes } from '@etsoo/shared';
import { Box, Button, Link } from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';
import { SmartApp } from './app/SmartApp';
import { SharedLayout } from './login/SharedLayout';
import { AccountCircle } from '@material-ui/icons';

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
  const mRef = React.createRef<TextFieldExMethods>();

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
        mRef.current?.setError(app.get<string>('userNotFound'));
        loginRef.current?.focus();
      } else {
        navigate!('login/password/' + encodeURIComponent(id));
      }
    }
  };

  return (
    <Context.Consumer>
      {(value) => (
        <SharedLayout
          pageRight={
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
          <HBox itemPadding={1} alignItems="flex-start">
            <Box sx={{ paddingTop: 3 }}>
              <AccountCircle color="primary" />
            </Box>
            <TextFieldEx
              label={value.get('loginId')}
              ref={mRef}
              inputRef={loginRef}
              autoCorrect="off"
              autoCapitalize="none"
              inputProps={{ inputMode: 'email' }}
              showClear={true}
              onEnter={(e) => {
                nextClick();
                e.preventDefault();
              }}
            />
          </HBox>
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
