// Dynamic Avatar Generator Utility with Zero-Network Fail-Safe

export const AVATAR_STYLES = [
  'bottts',
  'avataaars',
  'lorelei',
  'micah',
  'pixel-art',
  'fun-emoji',
  'shapes',
  'adventurer'
] as const;

export type AvatarStyle = typeof AVATAR_STYLES[number];

/**
 * Returns a randomized or seeded DiceBear SVG avatar URL, or fail-safe inline SVG.
 */
export function getAvatarUrl(seed: string, styleIndex?: number): string {
  const safeSeed = encodeURIComponent(seed || 'default_user');
  const index = styleIndex !== undefined ? styleIndex % AVATAR_STYLES.length : Math.abs(hashCode(safeSeed)) % AVATAR_STYLES.length;
  const style = AVATAR_STYLES[index];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${safeSeed}`;
}

/**
 * Generates a base64 encoded SVG Data URI locally so avatars ALWAYS render instantly in ALL browsers with 0 network calls!
 */
export function getLocalSvgAvatar(seed: string): string {
  const hash = Math.abs(hashCode(seed || 'user'));
  const hue1 = hash % 360;
  const hue2 = (hash + 120) % 360;

  const bg1 = `hsl(${hue1}, 80%, 45%)`;
  const bg2 = `hsl(${hue2}, 85%, 30%)`;

  const cleanSeed = seed.split('@')[0] || seed;
  const initials = cleanSeed
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map(s => s[0] ? s[0].toUpperCase() : '')
    .join('') || 'U';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="28" fill="${bg1}"/>
    <circle cx="50" cy="38" r="18" fill="rgba(255,255,255,0.25)"/>
    <path d="M 20 85 C 20 62, 35 56, 50 56 C 65 56, 80 62, 80 85 Z" fill="rgba(255,255,255,0.25)"/>
    <text x="50" y="52" font-family="sans-serif" font-size="28" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;

  try {
    const base64 = typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(svg))) : '';
    if (base64) {
      return `data:image/svg+xml;base64,${base64}`;
    }
  } catch (e) {
    console.error('Base64 encoding error:', e);
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Fast hash integer generator.
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}
