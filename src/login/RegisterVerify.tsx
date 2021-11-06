import React from 'react';
import { Button } from '@mui/material';
import { Redirect, RouteComponentProps } from '@reach/router';
import { SmartApp } from '../app/SmartApp';
import { SharedLayout } from './SharedLayout';
import { StorageUtils } from '@etsoo/shared';
import { CountdownButton, TextFieldEx, TextFieldExMethods } from '@etsoo/react';
import { ActionResultId, IActionResult } from '@etsoo/appscript';
import { Constants } from '../app/Constants';

function RegisterVerify(props: RouteComponentProps<{ username: string }>) {
  // App
  const app = SmartApp.instance;

  // Labels
  const labels = app.getLabels(
    'enterCodeTip',
    'verification',
    'resending',
    'enterCode',
    'submit'
  );

  // Destruct
  const { navigate, username } = props;

  // Refs
  const inputRef = React.useRef<HTMLInputElement>();
  const mRef = React.createRef<TextFieldExMethods>();

  if (username == null) {
    return <Redirect to={app.transformUrl('/login/register')} />;
  }

  // Code id
  let codeId = StorageUtils.getSessionData(Constants.CodeFieldRegister, '');

  // Decode
  const id = decodeURIComponent(username);

  // Tip
  const enterCodeTip = labels.enterCodeTip.format(id);

  // Resending
  const resending = async () => {
    const data = {
      region: app.region
    };

    let api: string;
    if (id.indexOf('@') === -1) {
      api = 'SendSMS';
      Object.assign(data, {
        mobile: id,
        action: 1
      });
    } else {
      api = 'SendEmail';
      Object.assign(data, {
        email: id,
        action: 2,
        timezone: app.getTimeZone()
      });
    }

    var result = await app.api.put<ActionResultId>(`AuthCode/${api}`, data);

    // Error, back to normal
    if (result == null) return 0;

    if (!result.ok) {
      // Popup
      app.alertResult(result);
      return 0;
    }

    if (result.data?.id == null) {
      return 0;
    }

    codeId = result.data?.id.toString();

    StorageUtils.setSessionData(Constants.CodeFieldRegister, codeId);

    mRef.current?.setError(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }

    return 90;
  };

  // Submit
  const submit = async () => {
    const input = inputRef.current!;
    if (input.value === '') {
      input.focus();
      return;
    }

    const result = await app.api.put<IActionResult>('AuthCode/Validate', {
      id: codeId,
      code: input.value
    });

    if (result == null) return;

    if (!result.ok) {
      mRef.current?.setError(result.title);
      return 0;
    }

    navigate!(app.transformUrl('/login/registercomplete/' + username));
  };

  return (
    <SharedLayout
      title={labels.verification}
      subTitle={enterCodeTip}
      buttons={[
        <CountdownButton
          variant="outlined"
          key="resending"
          ref={(instance: HTMLButtonElement | null) => {
            if (codeId === '') instance?.click();
          }}
          onAction={resending}
        >
          {labels.resending}
        </CountdownButton>,
        <Button variant="contained" key="submit" onClick={submit}>
          {labels.submit}
        </Button>
      ]}
      {...props}
    >
      <TextFieldEx
        label={labels.enterCode}
        autoCorrect="off"
        autoCapitalize="none"
        inputProps={{ inputMode: 'numeric' }}
        ref={mRef}
        inputRef={inputRef}
        showClear
        onEnter={(e) => {
          submit();
          e.preventDefault();
        }}
      />
    </SharedLayout>
  );
}

export default RegisterVerify;
