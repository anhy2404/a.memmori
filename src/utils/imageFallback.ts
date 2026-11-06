// Universal, rock-solid SVG avatar & photo fallbacks (Zero network dependency, never fails)

export function getFallbackAvatar(name?: string, role?: string): string {
  const cleanName = (name || 'Khách Du Lịch').trim();
  const words = cleanName.split(/\s+/);
  let initials = 'VN';
  if (words.length >= 2) {
    initials = (words[0][0] + words[words.length - 1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length > 0) {
    initials = words[0].slice(0, 2).toUpperCase();
  }

  // Generate deterministic gradient colors from name
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const palettes = [
    { from: '#7C3AED', to: '#EC4899', accent: '#DDD6FE' }, // Purple - Pink
    { from: '#2563EB', to: '#06B6D4', accent: '#BAE6FD' }, // Blue - Cyan
    { from: '#059669', to: '#10B981', accent: '#A7F3D0' }, // Emerald - Mint
    { from: '#D97706', to: '#F59E0B', accent: '#FDE68A' }, // Amber - Orange
    { from: '#E11D48', to: '#F43F5E', accent: '#FECDD3' }, // Rose - Coral
  ];
  const palette = palettes[Math.abs(hash) % palettes.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="g_${Math.abs(hash)}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.from}"/>
        <stop offset="100%" stop-color="${palette.to}"/>
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="64" fill="url(#g_${Math.abs(hash)})"/>
    <circle cx="64" cy="64" r="58" stroke="rgba(255,255,255,0.25)" stroke-width="3" fill="none"/>
    <text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="46" font-weight="900" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">
      ${initials}
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getFallbackPlaceImage(title?: string, isFood: boolean = false): string {
  const label = (title || 'Việt Nam').trim();
  const symbol = isFood ? '🍲' : '🏛️';
  const tag = isFood ? 'Ẩm Thực Việt Nam' : 'Danh Thắng Việt Nam';
  const bg1 = isFood ? '#78350F' : '#064E3B';
  const bg2 = isFood ? '#D97706' : '#059669';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="g_place" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#g_place)"/>
    <circle cx="400" cy="210" r="85" fill="rgba(255,255,255,0.12)"/>
    <text x="50%" y="225" font-family="system-ui, -apple-system, sans-serif" font-size="80" text-anchor="middle" dominant-baseline="middle">
      ${symbol}
    </text>
    <text x="50%" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="800" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">
      ${escapeXml(label)}
    </text>
    <text x="50%" y="390" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">
      ✨ ${tag} • Memmori
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export const safeImageOnError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: string
) => {
  const img = e.currentTarget;
  if (img.src !== fallback) {
    img.onerror = null;
    img.src = fallback;
  }
};
