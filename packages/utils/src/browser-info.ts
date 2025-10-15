/**
 * Browser Info Utility
 * Extracts browser, OS, and device information from user agent
 */

export interface BrowserInfo {
  browser: string;
  os: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

export function getBrowserInfo(userAgent?: string): BrowserInfo {
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');

  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('Chrome') && !ua.includes('Edge')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Edge')) {
    browser = 'Edge';
  } else if (ua.includes('MSIE') || ua.includes('Trident')) {
    browser = 'Internet Explorer';
  }

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows')) {
    os = 'Windows';
  } else if (ua.includes('Mac')) {
    os = 'macOS';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
  } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
  }

  // Detect device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (ua.includes('Mobile')) {
    deviceType = 'mobile';
  } else if (ua.includes('Tablet') || ua.includes('iPad')) {
    deviceType = 'tablet';
  }

  return {
    browser,
    os,
    deviceType,
  };
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
