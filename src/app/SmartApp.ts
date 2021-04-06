import { IExternalSettingsHost } from '@etsoo/appscript';
import { ApiDataError, createClient } from '@etsoo/restclient';
import { ISmartSettings } from './SmartSettings';

import zhCNLabels from '../i18n/zh-CN.json';
import enUSLabels from '../i18n/en-US.json';
import { DomUtils } from '@etsoo/shared';
import {
  LanguageState,
  NotificationRenderProps,
  NotifierMU,
  ReactApp,
  UserState
} from '@etsoo/react';
import { ISmartUser } from './SmartUser';
import React from 'react';

// Supported language
const supportedLanguages = [
  { name: 'zh-CN', label: '简体中文', labels: zhCNLabels },
  { name: 'en-US', label: 'English', labels: enUSLabels }
];

// Detected language
const { detectedLanguage } = DomUtils;

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

  private static _languageState: LanguageState;
  /**
   * Language state
   */
  static get languageState() {
    return SmartApp._languageState;
  }

  /**
   * Setup
   */
  static setup() {
    // Settings
    const settings: ISmartSettings = {
      // Merge external configs first
      ...((window as unknown) as IExternalSettingsHost).settings,

      // Detected language
      detectedLanguage,

      // Supported languages
      languages: supportedLanguages,

      // Current language
      currentLanguage: DomUtils.getLanguage(
        supportedLanguages,
        detectedLanguage
      )!
    };

    // Notifier
    SmartApp._notifierProvider = NotifierMU.setup();
    const notifier = NotifierMU.instance;

    // API
    const api = createClient();

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
          window.location.href = '/login';
        }
      });
    };

    SmartApp._instance = new SmartApp(settings, api, notifier);
    SmartApp._userState = new UserState<ISmartUser>();
    SmartApp._languageState = new LanguageState(settings.currentLanguage);
  }
}
