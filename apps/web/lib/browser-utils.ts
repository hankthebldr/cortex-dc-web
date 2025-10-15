/**
 * Browser Utility Functions
 * Client-side only utilities - no server dependencies
 */

export interface BrowserInfo {
  browser: string;
  os: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

/**
 * Get browser information from user agent
 */
export function getBrowserInfo(): BrowserInfo {
  if (typeof navigator === 'undefined') {
    return {
      browser: 'unknown',
      os: 'unknown',
      deviceType: 'desktop',
    };
  }

  const userAgent = navigator.userAgent;

  // Detect browser
  let browser = 'unknown';
  if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
  else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) browser = 'IE';
  else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';

  // Detect OS
  let os = 'unknown';
  if (userAgent.indexOf('Win') > -1) os = 'Windows';
  else if (userAgent.indexOf('Mac') > -1) os = 'MacOS';
  else if (userAgent.indexOf('Linux') > -1) os = 'Linux';
  else if (userAgent.indexOf('Android') > -1) os = 'Android';
  else if (userAgent.indexOf('like Mac') > -1) os = 'iOS';

  // Detect device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/Mobi|Android/i.test(userAgent)) deviceType = 'mobile';
  else if (/Tablet|iPad/i.test(userAgent)) deviceType = 'tablet';

  return { browser, os, deviceType };
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
