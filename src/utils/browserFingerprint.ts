export function getBrowserFingerprint(): string {
  const stored = localStorage.getItem('vinyl_user_id');
  if (stored) return stored;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    screen.width + 'x' + screen.height,
    screen.colorDepth.toString(),
  ];

  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    components.push(canvas.toDataURL());
  }

  const fingerprint = hashString(components.join('|'));
  localStorage.setItem('vinyl_user_id', fingerprint);

  return fingerprint;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'user_' + Math.abs(hash).toString(36);
}
