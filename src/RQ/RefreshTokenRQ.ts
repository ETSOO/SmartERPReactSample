/**
 * Refresh token request data
 */
export type RefreshTokenRQ = {
  /**
   * Password for login
   */
  pwd?: string;

  /**
   * Country or region
   */
  region: string;

  /**
   * Time zone
   */
  timezone?: string;
};
