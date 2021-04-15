import { IExternalSettingsHost } from '@etsoo/appscript';
import { ApiDataError, createClient } from '@etsoo/restclient';
import { ISmartSettings } from './SmartSettings';

import zhCNResources from '../i18n/zh-CN.json';
import enUSResources from '../i18n/en-US.json';
import { DataTypes, DomUtils } from '@etsoo/shared';
import {
  CultureState,
  NotificationRenderProps,
  NotifierMU,
  ReactApp,
  UserState
} from '@etsoo/react';
import { ISmartUser } from './SmartUser';
import React from 'react';

// Supported cultures
const supportedCultures = [
  { name: 'zh-CN', label: '简体中文', resources: zhCNResources },
  { name: 'en-US', label: 'English', resources: enUSResources }
];

// Detected culture
const { detectedCulture } = DomUtils;

/**
 * SmartERP App
 */
export class SmartApp extends ReactApp<ISmartSettings> {
  private static _instance: SmartApp;

  /**
   * Singleton instance
   */
  static get instance() {
    return SmartApp._instance;
  }

  private static _notifierProvider: React.FunctionComponent<NotificationRenderProps>;

  /**
   * Notifier provider
   */
  static get notifierProvider() {
    return SmartApp._notifierProvider;
  }

  private static _userState: UserState<ISmartUser>;
  /**
   * User state
   */
  static get userState() {
    return SmartApp._userState;
  }

  private static _cultureState: CultureState;
  /**
   * Culture state
   */
  static get cultureState() {
    return SmartApp._cultureState;
  }

  /**
   * Setup
   */
  static setup() {
    // Settings
    const settings: ISmartSettings = {
      // Merge external configs first
      ...((window as unknown) as IExternalSettingsHost).settings,

      // Detected culture
      detectedCulture,

      // Supported cultures
      cultures: supportedCultures,

      // Current culture
      currentCulture: {} as DataTypes.CultureDefinition
    };

    // Notifier
    SmartApp._notifierProvider = NotifierMU.setup();
    const notifier = NotifierMU.instance;

    // API
    // Suggest to replace {hostname} with current hostname
    const api = createClient();
    api.baseUrl = settings.endpoint.replace(
      '{hostname}',
      window.location.hostname
    );

    // Global API error handler
    api.onError = (error: ApiDataError) => {
      // Error code
      const status = error.response
        ? api.transformResponse(error.response).status
        : undefined;

      // Report the error
      // When status is equal to 401, redirect to login page
      notifier.alert(error.toString(), () => {
        if (status === 401) {
          // Redirect to login page
          window.location.href = SmartApp.instance.transformUrl('/');
        }
      });
    };

    // App
    const app = new SmartApp(settings, api, notifier);

    // Static reference
    SmartApp._instance = app;

    // Detect IP data
    // app.detectIP();

    // Set default language
    app.changeCulture(DomUtils.getCulture(supportedCultures, detectedCulture)!);

    SmartApp._userState = new UserState<ISmartUser>();
    SmartApp._cultureState = new CultureState(settings.currentCulture);
  }
}
