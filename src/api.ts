// Client-side API helpers: ML endpoints + gem mapping
import { HiddenGem } from './types';
import { ASSETS } from './data/mockData';

const GEM_IMAGES = [
  ASSETS.kaveriBamboo,
  ASSETS.mullayanagiri,
  ASSETS.chorlaGhat,
  ASSETS.netravaliFall,
  ASSETS.sweetwaterLake,
  ASSETS.spiceFarm,
];

const COLORS: Array<'primary' | 'secondary' | 'tertiary'> = [
  'primary',
  'secondary',
  'tertiary',
];

export interface ApiGem {
  place_id: string;
  name: string;
  city: string;
  category: string;
  cuisines: string;
  rating: number;
  review_count: number;
  hidden_gem_score: number;
  gem_score_10: number;
  safety_score: number;
  price_level: number;
  lat: number;
  lng: number;
}

export function apiGemToHidden(g: ApiGem, idx: number): HiddenGem {
  const price = Math.max(1, Math.min(3, Math.round(g.price_level) || 2));
  return {
    id: g.place_id,
    name: g.name,
    category: g.category || 'Local Eats',
    categoryIcon: 'restaurant',
    categoryColor: COLORS[idx % COLORS.length],
    description: `${g.cuisines?.replace(/[\\[\]']/g, '') || g.category} • ${g.city} • ★ ${g.rating} (${g.review_count} reviews)`,
    image: GEM_IMAGES[idx % GEM_IMAGES.length],
    distanceKm: 0,
    gemScore: g.gem_score_10,
    safetyScore: g.safety_score,
    womenSafe: g.safety_score >= 80,
    costLabel: '₹'.repeat(price),
    hikeDurationOrFeature: g.city,
    badgeLabel: g.hidden_gem_score >= 80 ? 'AI Verified Gem' : 'Model Pick',
    tags: [g.city, g.category, ...(g.cuisines?.slice(0, 40).split(/,\s*/).slice(0, 2) || [])].filter(Boolean),
    lat: g.lat,
    lng: g.lng,
  };
}

// GET hidden gems from the trained India model
export async function fetchHiddenGems(limit = 12): Promise<HiddenGem[]> {
  const res = await fetch(`/api/ml/hidden-gems?limit=${limit}&minScore=60`);
  if (!res.ok) throw new Error(`hidden-gems HTTP ${res.status}`);
  const data = await res.json();
  if (!data.success || !Array.isArray(data.gems)) throw new Error('bad gems payload');
  return data.gems.map(apiGemToHidden);
}

// POST RAG semantic search over the 102K vector store
export async function ragSearch(query: string, topK = 6, city = ''): Promise<HiddenGem[]> {
  const res = await fetch('/api/rag/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, topK, city }),
  });
  if (!res.ok) throw new Error(`rag HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data.results)) throw new Error('bad rag payload');
  return data.results.map((r: any, i: number) =>
    apiGemToHidden(
      {
        place_id: r.id,
        name: r.name,
        city: r.city,
        category: r.category,
        cuisines: r.document?.split('|')[4]?.replace('Cuisines:', '').trim() || '',
        rating: r.stars,
        review_count: 0,
        hidden_gem_score: r.hidden_gem_score,
        gem_score_10: Math.round(r.hidden_gem_score) / 10,
        safety_score: r.safety_score,
        price_level: 2,
        lat: 0,
        lng: 0,
      },
      i,
    ),
  );
}

export interface MatchUser {
  age: number;
  city: string;
  interests: string[];
  languages: string[];
  diet?: string;
  drinks?: string;
  smokes?: string;
  education?: string;
  height?: number;
  income?: number;
  essay_cosine?: number;
}

// POST matchmaking score (hybrid model)
export async function scoreMatch(userA: MatchUser, userB: MatchUser): Promise<{
  match_score: number;
  compatibility_probability: number;
  tier: string;
}> {
  const res = await fetch('/api/ml/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userA, userB }),
  });
  if (!res.ok) throw new Error(`match HTTP ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'match failed');
  return {
    match_score: data.match_score,
    compatibility_probability: data.compatibility_probability,
    tier: data.tier,
  };
}
