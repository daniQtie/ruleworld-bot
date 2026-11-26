// One fixed look per story name (writer.CAST), so the same character looks the same in every video.
const S = { light: '#f3c8a4', fair: '#f1cba9', tan: '#e9b78f', brown: '#c98d63', deep: '#8d5a3b' };
const kid = (kind, shirt, accent, pants, shoes, skin, hair, hairColor, more = {}) => ({ kind, shirt, accent, pants, shoes, skin: S[skin], hair, hairColor, ...more });
const adult = (...a) => ({ ...kid(...a), scale: a[8]?.scale || 1.12 });

export const LOOKS = {
  hana: kid('sweater', '#6a55c9', '#ff6f91', '#2d3553', '#f25f8a', 'light', 'long', '#5a2f22'),
  kaito: kid('hoodie', '#2f3a55', '#4fd6ff', '#242833', '#e8452f', 'fair', 'swoop', '#1f1714'),
  eli: kid('hoodie', '#17a58e', '#ffd23f', '#34415e', '#e8452f', 'brown', 'swoop', '#1f1714'),
  mason: kid('hoodie', '#2563c9', '#ffffff', '#4a5568', '#ffffff', 'light', 'short', '#6b4423'),
  lucy: kid('sweater', '#e0527a', '#ffd23f', '#3b3f5c', '#ffffff', 'fair', 'pony', '#d9a23f'),
  leo: kid('hoodie', '#e8763a', '#ffffff', '#3a3a46', '#222222', 'tan', 'puffs', '#4a2c17'),
  pia: kid('sweater', '#25a37a', '#ff8fb8', '#2d3553', '#ff8fb8', 'brown', 'bob', '#1b1210'),
  mia: kid('sweater', '#f0a52c', '#7a3fd1', '#3a3a46', '#ffffff', 'light', 'long', '#1f1714'),
  zoe: kid('hoodie', '#8e44ad', '#ffe066', '#28324a', '#ffe066', 'deep', 'pony', '#17100d'),
  jada: kid('sweater', '#d1453b', '#ffffff', '#253047', '#ffffff', 'deep', 'puffs', '#17100d'),
  marcus: kid('hoodie', '#b8322a', '#111111', '#20232d', '#ffffff', 'deep', 'short', '#2a160c'),
  rex: kid('hoodie', '#33373f', '#ff5a1f', '#44382c', '#111111', 'tan', 'swoop', '#a8431d'),
  ollie: kid('sweater', '#3b8f4a', '#ffffff', '#5a4630', '#6b4423', 'fair', 'puffs', '#d9902f', { glasses: true }),
  vince: kid('suit', '#4b3a8f', '#ffd23f', '#262636', '#101117', 'light', 'swoop', '#e0c060'),
  gwen: kid('sweater', '#2f6fd1', '#ffd23f', '#41354f', '#222222', 'light', 'bob', '#b5462a', { glasses: true }),
  noob: kid('plain', '#2f6fd1', '#ffffff', '#4f9d3a', '#333333', 'light', 'short', '#caa21c'),
  beanie: kid('hoodie', '#5a6b7d', '#ff9f1c', '#2e3440', '#ff9f1c', 'tan', 'short', '#3a2416', { beanie: '#e23d3d' }),
  noel: kid('sweater', '#d9dde4', '#3b8f4a', '#2f6b3d', '#ffffff', 'fair', 'puffs', '#d9822f'),
  baby: kid('plain', '#8fd3ff', '#ffffff', '#8fd3ff', '#ffffff', 'light', 'puffs', '#d9a23f', { scale: 0.58 }),
  mom: adult('sweater', '#c2466f', '#ffffff', '#303a52', '#5a2c24', 'tan', 'bob', '#4a2414'),
  dad: adult('sweater', '#2f5d7c', '#d8c27a', '#4a3b2c', '#3a2416', 'tan', 'short', '#3a2416'),
  grandma: adult('sweater', '#8a6bb5', '#ffffff', '#4b4458', '#4a2c2c', 'light', 'bun', '#d8d5d2', { glasses: true, scale: 1.04 }),
  grandpa: adult('suit', '#6d5a44', '#2f6b3d', '#3d352a', '#2b2018', 'tan', 'bald', '#d8d5d2', { glasses: true, scale: 1.06 }),
  teacher: adult('suit', '#3c4a63', '#2f86c9', '#2a2f3c', '#101117', 'brown', 'slick', '#2a1a10', { glasses: true }),
  mayor: adult('suit', '#6d1f35', '#ffd23f', '#2a1c26', '#101117', 'light', 'slick', '#b9b2ad', { sash: '#1f5fc2', scale: 1.14 }),
  officer: adult('police', '#1f3566', '#ffd23f', '#16233f', '#0e0f14', 'brown', 'short', '#17100d', { cap: '#1a2c5c' }),
  stranger: adult('suit', '#232634', '#d8293f', '#1b1d28', '#101117', 'tan', 'slick', '#c9c4c0'),
  doctor: adult('suit', '#eef2f5', '#2f86c9', '#7d8794', '#303030', 'deep', 'short', '#17100d', { glasses: true }),
};
