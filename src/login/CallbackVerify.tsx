import React from 'react';
import { Button, Typography } from '@mui/material';
import { Redirect, RouteComponentProps } from '@reach/router';
import { SmartApp } from '../app/SmartApp';
import { SharedLayout } from './SharedLayout';
import { CountdownButton, TextFieldEx, TextFieldExMethods } from '@etsoo/react';
import { ActionResultId, IActionResult } from '@etsoo/appscript';
import { StorageUtils } from '@etsoo/shared';
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
    return <Redirect to={app.transformUrl('/')} />;
  }

  // Code id
  let codeId = StorageUtils.getSessionData(Constants.CodeFieldCallback, '');

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
        action: 3
      });
    } else {
      api = 'SendEmail';
      Object.assign(data, {
        email: id,
        action: 4,
        timezone: app.getTimeZone()
      });
    }

    var result = await app.api.put<ActionResultId>(`AuthCode/${api}`, data);

    // Error, back to normal
    if (result == null) return 0;

    if (result.data?.id == null) {
      return 0;
    }

    codeId = result.data?.id.toString();

    StorageUtils.setSessionData(Constants.CodeFieldCallback, codeId);

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

    navigate!(app.transformUrl('/login/callbackcomplete/' + username));
  };

  return (
    <SharedLayout
      title={labels.verification}
      subTitle={<Typography variant="subtitle2">{enterCodeTip}</Typography>}
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
        showClear={true}
        onEnter={(e) => {
          submit();
          e.preventDefault();
        }}
      />
    </SharedLayout>
  );
}

export default RegisterVerify;
