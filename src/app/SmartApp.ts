import { AddressUtils, IExternalSettingsHost } from '@etsoo/appscript';
import {
  ApiAuthorizationScheme,
  createClient,
  IApiPayload
} from '@etsoo/restclient';
import { ISmartSettings } from './SmartSettings';

import zhCNResources from '../i18n/zh-CN.json';
import enUSResources from '../i18n/en-US.json';
import { DataTypes, DomUtils, StorageUtils, Utils } from '@etsoo/shared';
import {
  CultureState,
  Labels,
  MUGlobal,
  NotificationRenderProps,
  NotifierMU,
  PageState,
  ProgressCount,
  ReactApp
} from '@etsoo/react';
import { ISmartUser } from './SmartUser';
import React from 'react';
import { RefreshTokenRQ } from '../RQ/RefreshTokenRQ';
import { LoginResult } from '../models/LoginResult';
import { Constants } from './Constants';
import { ISmartPageData } from './SmartPageData';

// Supported cultures
const supportedCultures: DataTypes.CultureDefinition[] = [
  { name: 'zh-CN', label: '简体中文', resources: zhCNResources },
  { name: 'en-US', label: 'English', resources: enUSResources }
];

// Supported regions
const supportedRegions = ['CN', 'US'];

// Detected country or region
const { detectedCountry } = DomUtils;

// Detected culture
const { detectedCulture } = DomUtils;

// Global settings
MUGlobal.textFieldVariant = 'standard';

/**
 * SmartERP App
 */
export class SmartApp extends ReactApp<
  ISmartSettings,
  ISmartUser,
  ISmartPageData
> {
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

  private static _cultureState: CultureState;
  /**
   * Culture state
   */
  static get cultureState() {
    return SmartApp._cultureState;
  }

  private static _pageState: PageState<ISmartPageData>;
  /**
   * Page state
   */
  static get pageState() {
    return SmartApp._pageState;
  }

  /**
   * Setup
   */
  static setup() {
    // Culture
    const currentCulture = DomUtils.getCulture(
      supportedCultures,
      detectedCulture
    )!;

    // Current country or region
    const currentRegion = AddressUtils.getRegion(
      supportedRegions,
      detectedCountry,
      currentCulture.name
    );

    // Settings
    const settings: ISmartSettings = {
      // Merge external configs first
      ...(window as unknown as IExternalSettingsHost).settings,

      // Authorization scheme
      authScheme: ApiAuthorizationScheme.Bearer,

      // Detected culture
      detectedCulture,

      // Supported cultures
      cultures: supportedCultures,

      // Supported regions
      regions: supportedRegions,

      // Browser's time zone
      timeZone: Utils.getTimeZone(),

      // Current country or region
      currentRegion,

      // Current culture
      currentCulture
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

    // App
    const app = new SmartApp(settings, api, notifier);

    // Static reference
    SmartApp._instance = app;

    // Auto start to detect IP data
    app.detectIP();

    // States
    SmartApp._cultureState = new CultureState(settings.currentCulture);
    SmartApp._pageState = new PageState();
  }

  /**
   * Change culture
   * @param culture New culture definition
   */
  changeCulture(culture: DataTypes.CultureDefinition) {
    // Update component labels
    Labels.setLabels(culture.resources, {
      notificationMU: {
        alertTitle: 'warning',
        alertOK: 'ok',
        confirmTitle: 'confirm',
        confirmYes: 'ok',
        confirmNo: 'cancel',
        promptTitle: 'prompt',
        promptCancel: 'cancel',
        promptOK: 'ok'
      }
    });

    // Change culture
    super.changeCulture(culture);

    // Change page title
    document.title = this.get<string>('smartERP')!;
  }

  /**
   * Fresh countdown UI
   * @param callback Callback
   */
  freshCountdownUI(_callback: () => void) {
    // Labels
    const labels = this.getLabels('cancel', 'tokenExpiry');

    // Progress
    const progress = React.createElement(ProgressCount, {
      seconds: 30,
      valueUnit: 's',
      onComplete: () => {
        // Stop the progress
        return false;
      }
    });

    // Popup
    this.notifier.alert(
      labels.tokenExpiry,
      () => {
        this.tryLogin();
        //callback();
      },
      {
        okLabel: labels.cancel,
        primaryButton: { fullWidth: true, autoFocus: false },
        inputs: progress
      }
    );
  }

  /**
   * Refresh token
   */
  override async refreshToken() {
    // Data
    const { data, payload } = this.createRefreshData();

    // Check
    if (data == null || payload == null) return false;

    // Call API
    const result = await this.api.put<LoginResult>(
      'Auth/RefreshToken',
      data,
      payload
    );

    if (result == null) return false;

    if (result.success) {
      // Auto success
      this.doSuccess(result, payload);
    }

    return true;
  }

  private createRefreshData = () => {
    // Token
    const refreshToken = this.getCacheToken();
    if (refreshToken == null || refreshToken === '') {
      return {};
    }

    // Refresh token
    const fieldName = Constants.TokenHeaderRefresh;

    // Reqest data
    const data: RefreshTokenRQ = {
      region: this.region!,
      timezone: this.settings.timeZone ?? this.ipData?.timezone
    };

    // Payload
    const payload: IApiPayload<LoginResult, any> = {
      // No loading bar needed to avoid screen flicks
      showLoading: false,
      config: { headers: { [fieldName]: refreshToken } }
    };

    return { data, payload };
  };

  // Success
  private doSuccess = (
    result: LoginResult,
    payload: IApiPayload<LoginResult, any>
  ) => {
    // Token
    const newRefreshToken = this.getResponseToken(payload.response);
    if (newRefreshToken == null || result.data == null) {
      return false;
    }

    // Keep
    const keep = StorageUtils.getLocalData(Constants.FieldLoginKeep, false);

    // User data
    const userData = result.data;

    // User login
    this.userLogin(userData, newRefreshToken, keep);

    return true;
  };

  /**
   * Signout
   */
  async signout() {
    await this.api.put<boolean>('User/Signout', undefined, {
      onError: (error) => {
        console.log(error);
        // Prevent further processing
        return false;
      }
    });

    // Clear
    this.userLogout();

    // Go to login page
    this.toLoginPage();
  }

  /**
   * Go to the login page
   */
  toLoginPage() {
    window.location.replace(this.transformUrl('/'));
  }

  /**
   * Try login
   */
  override async tryLogin() {
    // Reset user state
    const result = await super.tryLogin();
    if (!result) return false;

    // Data
    const { data, payload } = this.createRefreshData();

    // Check
    if (data == null || payload == null) {
      this.toLoginPage();
      return false;
    }

    // Call API
    const loginResult = await this.api.put<LoginResult>(
      'Auth/RefreshToken',
      data,
      payload
    );

    if (loginResult == null) return false;

    if (loginResult.success) {
      // Auto success
      if (!this.doSuccess(loginResult, payload)) {
        this.toLoginPage();
        return false;
      }
      return true;
    }

    if (loginResult.type === 'TokenExpired') {
      // Dialog to receive password
      var labels = this.getLabels('reloginTip', 'login');
      this.notifier.prompt(
        labels.reloginTip,
        async (pwd) => {
          // Set password for the action
          data.pwd = pwd;

          // Submit again
          const result = await this.api.put<LoginResult>(
            'Auth/RefreshToken',
            data,
            payload
          );

          if (result != null && result.success) {
            // Manual success
            this.doSuccess(result, payload);
          }
        },
        labels.login,
        { type: 'password' }
      );
      return false;
    }

    this.toLoginPage();

    return false;
  }
}
