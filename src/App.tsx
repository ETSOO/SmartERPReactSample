import React from 'react';
import { HBox, ItemList, TextFieldEx, TextFieldExMethods } from '@etsoo/react';
import { DataTypes, StorageUtils } from '@etsoo/shared';
import { Box, Button, Link } from '@mui/material';
import { RouteComponentProps } from '@reach/router';
import { SmartApp } from './app/SmartApp';
import { SharedLayout } from './login/SharedLayout';
import { AccountCircle, Language } from '@mui/icons-material';

import './App.css';
import { AddressRegion, IActionResult } from '@etsoo/appscript';
import { Constants } from './app/Constants';
import { IApiPayload } from '@etsoo/restclient';
import { LoginIdRQ } from './RQ/LoginIdRQ';
import { RefreshTokenRQ } from './RQ/RefreshTokenRQ';
import { LoginResult } from './models/LoginResult';

function App(props: RouteComponentProps) {
  // Destruct
  const { navigate, location } = props;

  // Queries
  const search = new URLSearchParams(location?.search);

  // User login id, email or mobile, saved
  const userIdSaved = StorageUtils.getLocalData(Constants.FieldUserIdSaved, '');

  // Query id or saved
  const id = search.get('loginid') ?? userIdSaved;

  // Register id
  const [registerId, updateRegisterId] = React.useState('');

  // App
  const app = SmartApp.instance;

  // Country or region
  const [regionId, updateRegionId] = React.useState(app.region);

  // Try to detect IP
  if (regionId == null) {
    app.detectIP(() => {
      const newRegionId =
        app.ipData == null ? app.settings.regions[0] : app.ipData.countryCode;
      app.changeRegion(newRegionId);
      updateRegionId(newRegionId);
    });
  }

  // Culture context
  const Context = SmartApp.cultureState.context;

  // Culture dispatch
  const { dispatch } = React.useContext(Context);

  // Change country or region
  const closeRegionChoose = (item: AddressRegion) => {
    if (item != null) {
      app.changeRegion(item.id);
    }
  };

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
    const data: LoginIdRQ = {
      id,
      region: regionId
    };

    const result = await app.api.get<IActionResult>('Auth/LoginId', data);
    if (result == null) return;

    if (!result.ok) {
      mRef.current?.setError(result.title);
      loginRef.current?.focus();

      // Put last avoid skipping next updates
      updateRegisterId(encodeURIComponent(id));
    } else {
      // Without password verification, no user id returned
      navigate!('login/password/' + encodeURIComponent(id));
    }
  };

  // First layout
  React.useEffect(() => {
    const input = loginRef.current!;
    if (id) {
      input.value = id;
      input.focus();
    }
  }, [id]);

  // Refresh token
  const refreshToken = app.getCacheToken();

  // Save login
  const trySaveLogin =
    search.get('tryLogin') !== 'false' &&
    (id === '' || id === userIdSaved) &&
    refreshToken != null;

  // Visible
  const [visible, setVisible] = React.useState(!trySaveLogin);

  React.useEffect(() => {
    if (!trySaveLogin) return;

    const keep = StorageUtils.getLocalData(Constants.FieldLoginKeep, false);

    // Refresh token
    const fieldName = Constants.TokenHeaderRefresh;

    // Reqest data
    const data: RefreshTokenRQ = {
      region: regionId,
      timezone: app.getTimeZone()
    };

    // Payload
    const payload: IApiPayload<LoginResult, any> = {
      config: { headers: { [fieldName]: refreshToken! } }
    };

    // Call API
    app.api
      .put<LoginResult>('Auth/RefreshToken', data, payload)
      .then((result) => {
        if (result == null || !result.ok) {
          setVisible(true);
          return;
        }

        // Token
        const refreshToken = app.getResponseToken(payload.response);
        if (refreshToken == null || result.data == null) return;

        // User data
        const userData = result.data;

        // User login
        app.userLogin(userData, refreshToken, keep);

        // Navigate to service
        navigate!(app.transformUrl('/home'));
      });
  }, [regionId, trySaveLogin, refreshToken, navigate, app]);

  return (
    <Context.Consumer>
      {(value) => (
        <SharedLayout
          visible={visible}
          pageRight={
            <HBox width={200} spacing={0.5} justifyContent="flex-end">
              {regionId && (
                <ItemList
                  items={app.getRegions()}
                  labelField="name"
                  size="small"
                  title={value.get('region')}
                  onClose={closeRegionChoose}
                  selectedValue={regionId}
                  className="noneTransformButton"
                />
              )}
              <ItemList
                items={app.settings.cultures}
                idField="name"
                size="small"
                title={value.get('languages')}
                onClose={closeCultureChoose}
                selectedValue={app.culture}
                className="noneTransformButton"
                icon={<Language />}
              />
            </HBox>
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
          <HBox spacing={1} alignItems="flex-start">
            <Box sx={{ paddingTop: 3 }}>
              <AccountCircle color="primary" />
            </Box>
            <TextFieldEx
              label={value.get('loginId')}
              ref={mRef}
              inputRef={loginRef}
              autoFocus
              autoCorrect="off"
              autoCapitalize="none"
              inputProps={{ inputMode: 'email' }}
              showClear={true}
              autoComplete="username"
              onEnter={(e) => {
                nextClick();
                e.preventDefault();
              }}
            />
          </HBox>
          <div>
            {value.get('noAccountTip')}&nbsp;
            <Link href={'login/register/' + registerId}>
              {value.get('noAccountCreate')}
            </Link>
          </div>
        </SharedLayout>
      )}
    </Context.Consumer>
  );
}

export default App;
