import {
  CommonPage,
  UserAvatarEditor,
  UserAvatarEditorToBlob
} from '@etsoo/react';
import { RouteComponentProps } from '@reach/router';
import { SmartApp } from '../app/SmartApp';
import { UserDetector } from '../app/UserDetector';

function Dashboard(props: RouteComponentProps) {
  // App
  const app = SmartApp.instance;

  const handleDone = (
    canvas: HTMLCanvasElement,
    toBlob: UserAvatarEditorToBlob
  ) => {
    console.log(canvas.width, canvas.height);
    toBlob(canvas, 'image/jpeg', 1).then((blob) => console.log(blob.size));
  };

  return (
    <CommonPage sx={{ width: 'fit-content' }}>
      <UserDetector />
      <UserAvatarEditor onDone={handleDone} />
    </CommonPage>
  );
}

export default Dashboard;
