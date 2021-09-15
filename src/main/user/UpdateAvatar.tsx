import {
  CommonPage,
  UserAvatarEditor,
  UserAvatarEditorToBlob
} from '@etsoo/react';
import { Stack } from '@mui/material';
import { RouteComponentProps } from '@reach/router';
import React from 'react';
import { SmartApp } from '../../app/SmartApp';

function UpdateAvatar(props: RouteComponentProps) {
  // App
  const app = SmartApp.instance;

  // Labels
  const labels = app.getLabels('avatar');

  // Destruct
  const { navigate } = props;

  // User context
  const Context = app.userState.context;

  const handleDone = async (
    canvas: HTMLCanvasElement,
    toBlob: UserAvatarEditorToBlob
  ) => {
    // Photo blob
    const blob = await toBlob(canvas, 'image/jpeg', 1);

    // Form data
    const form = new FormData();
    form.append('avatar', blob);

    var result = await app.api.put<string>('User/UploadAvatar', form);
    if (result == null) return;

    // Refresh token to get the updated avatar
    app.refreshToken().then(() => {
      navigate!(app.transformUrl('/home/'));
    });
  };

  React.useEffect(() => {
    // Page title
    app.setPageKey('updateAvatar');
  }, [app]);

  return (
    <CommonPage sx={{ width: 'fit-content' }}>
      <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} spacing={1}>
        <Context.Consumer>
          {(user) => (
            <img
              src={user.state.avatar}
              alt={labels.avatar}
              style={{
                width: '308px',
                height: '300px',
                border: '1px solid #666'
              }}
            />
          )}
        </Context.Consumer>
        <UserAvatarEditor onDone={handleDone} />
      </Stack>
    </CommonPage>
  );
}

export default UpdateAvatar;
