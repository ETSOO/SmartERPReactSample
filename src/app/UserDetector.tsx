import { SmartApp } from './SmartApp';
import { ISmartUser } from './SmartUser';

/**
 * User detect callback interface
 */
export interface IUserDetectCallback {
  (state: ISmartUser): void;
}

/**
 * User detector component
 * @returns component
 */
export function UserDetector(props: { success?: IUserDetectCallback }) {
  // App
  const app = SmartApp.instance;

  // Success callback
  const { success } = props;

  return (
    <app.userStateUpdate
      update={(state) => {
        if (state.authorized == null) {
          app.tryLogin();
        } else if (!state.authorized) {
          app.toLoginPage();
        } else if (success != null) {
          success(state);
        }
      }}
    />
  );
}
