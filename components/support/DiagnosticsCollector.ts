export function collectDiagnostics(options: {
  organizationId?: string;
  userId?: string;
  agentId?: string;
  includeConsoleLogs?: boolean;
}) {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let browser = 'Unknown';
  let browserVersion = '';
  if (ua.includes('Chrome')) {
    browser = 'Chrome';
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Safari')) {
    browser = 'Safari';
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || '';
  }

  let os = 'Unknown';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return {
    browser,
    browserVersion,
    os,
    device: typeof navigator !== 'undefined' ? (navigator.platform || 'Unknown') : 'Unknown',
    screenSize: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
    timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '',
    currentPage: typeof window !== 'undefined' ? window.location.href : '',
    organizationId: options.organizationId,
    userId: options.userId,
    agentId: options.agentId,
    consoleLogs: options.includeConsoleLogs ? '' : undefined,
  };
}
