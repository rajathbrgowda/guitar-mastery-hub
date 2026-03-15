import type { ToolCategory } from '@gmh/shared/types';

export interface StaticTool {
  key: string;
  name: string;
  url: string;
  description: string;
  category: ToolCategory;
  price: 'free' | 'freemium' | 'paid';
  stars: number;
  platform: string;
}

export const STATIC_TOOLS: StaticTool[] = [
  {
    key: 'justinguitar',
    name: 'JustinGuitar',
    url: 'https://www.justinguitar.com',
    description: 'The best free structured guitar course online. Grades 1–8, over 1000 lessons.',
    category: 'learning',
    price: 'free',
    stars: 5,
    platform: 'Web + App',
  },
  {
    key: 'fender-play',
    name: 'Fender Play',
    url: 'https://www.fender.com/play',
    description: 'Song-based video lessons for beginners. Good for motivation via songs you know.',
    category: 'learning',
    price: 'freemium',
    stars: 4,
    platform: 'Web + App',
  },
  {
    key: 'yousician',
    name: 'Yousician',
    url: 'https://yousician.com',
    description: 'Interactive lessons with real-time pitch detection. Gamified practice sessions.',
    category: 'learning',
    price: 'freemium',
    stars: 4,
    platform: 'Web + App',
  },
  {
    key: 'fender-tune',
    name: 'Fender Tune',
    url: 'https://www.fender.com/tune',
    description: 'Best free chromatic tuner app. Accurate, fast, clean UI.',
    category: 'tuning',
    price: 'free',
    stars: 5,
    platform: 'iOS + Android',
  },
  {
    key: 'guitartuna',
    name: 'GuitarTuna',
    url: 'https://www.guitartuna.com',
    description: 'Popular tuner with chord library and metronome built in.',
    category: 'tuning',
    price: 'freemium',
    stars: 4,
    platform: 'iOS + Android',
  },
  {
    key: 'metronome-online',
    name: 'Metronome Online',
    url: 'https://www.metronome-online.com',
    description: 'No-install browser metronome. Simple and reliable.',
    category: 'practice',
    price: 'free',
    stars: 4,
    platform: 'Web',
  },
  {
    key: 'soundslice',
    name: 'Soundslice',
    url: 'https://www.soundslice.com',
    description: 'Interactive notation and tab viewer with audio sync. Great for transcription.',
    category: 'practice',
    price: 'freemium',
    stars: 5,
    platform: 'Web',
  },
  {
    key: 'ultimate-guitar',
    name: 'Ultimate Guitar',
    url: 'https://www.ultimate-guitar.com',
    description: 'Largest tab library online. Useful but varies in quality — verify with your ear.',
    category: 'practice',
    price: 'freemium',
    stars: 4,
    platform: 'Web + App',
  },
  {
    key: 'musictheory-net',
    name: 'musictheory.net',
    url: 'https://www.musictheory.net',
    description: 'Free music theory lessons and exercises. Solid fundamentals for guitarists.',
    category: 'theory',
    price: 'free',
    stars: 4,
    platform: 'Web',
  },
  {
    key: 'tenuto',
    name: 'Tenuto',
    url: 'https://www.musictheory.net/products/tenuto',
    description: 'Music theory exercises app. Ear training, chord identification, note reading.',
    category: 'theory',
    price: 'paid',
    stars: 4,
    platform: 'iOS',
  },
  {
    key: 'chordify',
    name: 'Chordify',
    url: 'https://chordify.net',
    description: 'Paste any song URL and get chords synced to the audio. Great for learning songs.',
    category: 'theory',
    price: 'freemium',
    stars: 4,
    platform: 'Web + App',
  },
  {
    key: 'garageband',
    name: 'GarageBand',
    url: 'https://www.apple.com/mac/garageband',
    description: 'Free recording DAW for Mac and iOS. Great for recording practice sessions.',
    category: 'recording',
    price: 'free',
    stars: 5,
    platform: 'Mac + iOS',
  },
  {
    key: 'audacity',
    name: 'Audacity',
    url: 'https://www.audacityteam.org',
    description: 'Free open-source audio recorder and editor. Cross-platform.',
    category: 'recording',
    price: 'free',
    stars: 4,
    platform: 'Mac + Windows + Linux',
  },
];

// Phase-to-recommended-tools mapping (phase_index 0-based)
export const PHASE_TOOL_RECOMMENDATIONS: Record<number, string[]> = {
  0: ['justinguitar', 'fender-tune'], // Phase 1: Foundations
  1: ['justinguitar', 'metronome-online'], // Phase 2: Core Skills
  2: ['soundslice', 'ultimate-guitar'], // Phase 3: Songs & Application
  3: ['musictheory-net', 'soundslice'], // Phase 4: Theory & Technique
  4: ['garageband', 'soundslice'], // Phase 5+: Advanced
};

export const TOOL_KEYS = new Set(STATIC_TOOLS.map((t) => t.key));
