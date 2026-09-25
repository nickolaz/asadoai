import { products } from '@/data/products';

type VtexProduct = {
  productName?: string;
  items?: Array<{
    sellers?: Array<{
      commertialOffer?: { Price?: number; ListPrice?: number; AvailableQuantity?: number };
    }>;
  }>;
};

export type LivePriceSnapshot = {
  prices: Record<string, number>;
  source: 'Disco';
  sourceUrl: string;
  updatedAt: string;
};

const DISCO_CUTS_URL = 'https://www.disco.com.ar/carnes/carne-vacuna?page=1';
const CACHE_TTL_MS = 15 * 60 * 1000;
let cache: { expiresAt: number; snapshot: LivePriceSnapshot } | null = null;

const searches: Record<string, { query: string; words: string[] }> = {
  vacio: { query: 'vacio', words: ['vacio'] },
  tira: { query: 'tira asado', words: ['tira', 'asado'] },
  lomo: { query: 'lomo', words: ['lomo'] },
  entrania: { query: 'entrana', words: ['entrana'] },
  matambre: { query: 'matambre', words: ['matambre'] },
  colita: { query: 'colita cuadril', words: ['colita', 'cuadril'] },
  bondiola: { query: 'bondiola', words: ['bondiola'] },
  banderita: { query: 'asado banderita', words: ['asado', 'banderita'] },
};

/**
 * Reads public product search results from Disco's storefront. Results are
 * advisory: if a cut is absent, unavailable, or the source is down, callers
 * keep the static reference price for that product.
 */
export async function getLiveCutPrices(): Promise<LivePriceSnapshot | null> {
  if (cache && cache.expiresAt > Date.now()) return cache.snapshot;

  const meatIds = products
    .filter((product) => product.category === 'carne' && product.unit === 'kg')
    .map((product) => product.id);
  const entries = await Promise.allSettled(meatIds.map(async (id) => [id, await queryDisco(id)] as const));
  const prices: Record<string, number> = {};
  for (const entry of entries) {
    if (entry.status === 'fulfilled' && entry.value[1] !== null) {
      prices[entry.value[0]] = entry.value[1];
    }
  }

  if (Object.keys(prices).length === 0) return null;

  const snapshot: LivePriceSnapshot = {
    prices,
    source: 'Disco',
    sourceUrl: DISCO_CUTS_URL,
    updatedAt: new Date().toISOString(),
  };
  cache = { expiresAt: Date.now() + CACHE_TTL_MS, snapshot };
  return snapshot;
}

async function queryDisco(productId: string): Promise<number | null> {
  const search = searches[productId];
  if (!search) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    const url = `https://www.disco.com.ar/api/catalog_system/pub/products/search/v2/?ft=${encodeURIComponent(search.query)}&_from=0&_to=9`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    const product = asProducts(payload).find((candidate) => {
      const name = normalize(candidate.productName ?? '');
      return search.words.every((word) => name.includes(word));
    });
    const offer = product?.items?.flatMap((item) => item.sellers ?? [])
      .map((seller) => seller.commertialOffer)
      .find((candidate) => Number.isFinite(candidate?.Price) && (candidate?.AvailableQuantity ?? 0) > 0);
    const price = offer?.Price;
    return typeof price === 'number' && price > 0 ? Math.round(price) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function asProducts(payload: unknown): VtexProduct[] {
  if (Array.isArray(payload)) return payload as VtexProduct[];
  if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray(payload.data)) {
    return payload.data as VtexProduct[];
  }
  return [];
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
