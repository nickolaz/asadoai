import { products } from '@/data/products';

export type PlanInput = { people: number; budget: number; location: string };
export type PlanItem = { productId: string; quantity: number };

/** This is the only shape accepted from the LLM for meat recommendations. */
export type CutRecommendation = { productId: string; quantityKg: number };

const meatProducts = products.filter((product) => product.category === 'carne' && product.unit === 'kg');

function roundToHalf(value: number) {
  return Math.round(value * 2) / 2;
}

function defaultCuts(input: PlanInput): CutRecommendation[] {
  return [
    { productId: 'vacio', quantityKg: Math.max(1, roundToHalf(input.people * 0.18)) },
    { productId: 'tira', quantityKg: Math.max(1, roundToHalf(input.people * 0.12)) },
  ];
}

/**
 * Removes unknown IDs, aggregates duplicates, rounds to 500 g and clamps every
 * recommendation to the static product limits. Prices never come from the model.
 */
export function normalizeCutRecommendations(recommendations: CutRecommendation[] | undefined) {
  const quantities = new Map<string, number>();

  for (const recommendation of recommendations ?? []) {
    const product = meatProducts.find((candidate) => candidate.id === recommendation.productId);
    if (!product || !Number.isFinite(recommendation.quantityKg)) continue;
    quantities.set(product.id, (quantities.get(product.id) ?? 0) + recommendation.quantityKg);
  }

  return [...quantities.entries()].map(([productId, quantity]) => {
    const product = meatProducts.find((candidate) => candidate.id === productId)!;
    return {
      productId,
      quantity: Math.min(product.maxQuantity, Math.max(product.minQuantity, roundToHalf(quantity))),
    };
  });
}

function supportItems(input: PlanInput): PlanItem[] {
  return [
    { productId: 'chorizo', quantity: input.people },
    { productId: 'morcilla', quantity: Math.max(2, Math.ceil(input.people / 2)) },
    { productId: 'carbon', quantity: Math.max(2, Math.ceil(input.people / 4)) },
    { productId: 'bebidas', quantity: Math.max(1, Math.ceil(input.people / 4)) },
  ];
}

export function createSeedPlan(input: PlanInput, recommendations?: CutRecommendation[], priceOverrides: Record<string, number> = {}) {
  const selectedCuts = normalizeCutRecommendations(recommendations);
  const cuts = selectedCuts.length > 0
    ? selectedCuts
    : normalizeCutRecommendations(defaultCuts(input));
  const quantities = [...cuts, ...supportItems(input)];

  const items = quantities.map(({ productId, quantity }) => {
    const product = products.find((item) => item.id === productId)!;
    const price = priceOverrides[productId] ?? product.price;
    return { ...product, price, quantity, subtotal: price * quantity };
  });
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    input,
    items,
    total,
    remainingBudget: input.budget - total,
    tips: ['Encendé el carbón 90 minutos antes.', 'Dejá reposar la carne 10 minutos antes de cortar.'],
    schedule: [
      { time: '18:00', action: 'Encender el carbón', detail: 'Esperá a que las brasas estén parejas y sin llama.' },
      { time: '18:30', action: 'Poner los cortes principales', detail: 'Cociná a fuego medio y controlá la temperatura.' },
      { time: '19:00', action: 'Sumar chorizos y morcillas', detail: 'Ubicalos en una zona de calor más suave.' },
      { time: '20:00', action: 'Servir y disfrutar', detail: 'Dejá reposar los cortes antes de cortar.' },
    ],
  };
}
