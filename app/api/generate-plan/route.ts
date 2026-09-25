import { gateway, generateText, Output } from 'ai';
import { z } from 'zod';
import { imageSources } from '@/data/images';
import { products } from '@/data/products';
import { getLiveCutPrices } from '@/lib/live-prices';
import { createSeedPlan } from '@/lib/plan';

export const runtime = 'edge';

const inputSchema = z.object({
  people: z.number().int().min(1).max(30),
  budget: z.number().min(10000).max(1000000),
  location: z.string().trim().min(2).max(80),
});

const availableCuts = products.filter((product) => product.category === 'carne' && product.unit === 'kg');
const availableCutIds = availableCuts.map((product) => product.id) as [string, ...string[]];
const aiSchema = z.object({
  cuts: z.array(z.object({
    productId: z.enum(availableCutIds),
    quantityKg: z.number().min(0.5).max(8),
  })).min(2).max(4),
  tips: z.array(z.string().min(8).max(160)).min(1).max(3),
}).superRefine(({ cuts }, context) => {
  if (new Set(cuts.map((cut) => cut.productId)).size !== cuts.length) {
    context.addIssue({ code: 'custom', message: 'Los cortes deben ser únicos.' });
  }
});
const scheduleSchema = z.object({
  schedule: z.array(z.object({
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    action: z.string().min(4).max(90),
    detail: z.string().min(8).max(130),
  })).min(4).max(6),
});

export async function POST(request: Request) {
  let input;

  try {
    input = inputSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: 'Revisá personas, presupuesto y ubicación.' }, { status: 400 });
    return Response.json({ error: 'No pudimos leer los datos del plan.' }, { status: 400 });
  }

  const livePrices = await getLiveCutPrices();
  const buildPlan = (recommendations?: { productId: string; quantityKg: number }[]) => {
    const plan = createSeedPlan(input, recommendations, livePrices?.prices);
    return livePrices
      ? { ...plan, priceSource: livePrices, scheduleSource: 'fallback' as 'ai' | 'fallback' }
      : { ...plan, scheduleSource: 'fallback' as 'ai' | 'fallback' };
  };

  // The deterministic path keeps the MVP useful in local development or if Gateway is unavailable.
  if (!process.env.AI_GATEWAY_API_KEY) return Response.json(buildPlan());

  try {
    const catalog = availableCuts.map((product) => ({
      id: product.id,
      name: product.name,
      minKg: product.minQuantity,
      maxKg: product.maxQuantity,
      pricePerKgArs: livePrices?.prices[product.id] ?? product.price,
      image: imageSources.cuts[product.id as keyof typeof imageSources.cuts],
    }));
    const { output } = await generateText({
      model: gateway(process.env.AI_MODEL ?? 'google/gemini-2.5-flash'),
      output: Output.object({ schema: aiSchema }),
      prompt: `Sos un parrillero argentino y armás la selección de carne de un asado. Respondé únicamente con el esquema solicitado. Para ${input.people} personas, presupuesto orientativo de ${input.budget} ARS y ubicación ${input.location}, elegí entre 2 y 4 cortes del catálogo. Las cantidades deben estar expresadas en kg y en múltiplos de 0,5. Procurá aproximadamente 300 g de carne principal por persona entre todos los cortes, ajustando la selección al presupuesto: la aplicación suma chorizos y morcillas por separado. Los precios del catálogo son solo referencia para elegir: nunca los devuelvas ni calcules totales. No devuelvas chorizo, morcilla, bebidas, carbón ni IDs que no estén en el catálogo: la aplicación agrega esos acompañamientos y calcula todos los importes. Catálogo autorizado, incluida su relación local de imagen: ${JSON.stringify(catalog)}.`,
    });

    const plan = buildPlan(output?.cuts);
    if (output?.tips?.length) plan.tips = output.tips;
    try {
      const { output: cookingOutput } = await generateText({
        model: gateway(process.env.AI_MODEL ?? 'google/gemini-2.5-flash'),
        output: Output.object({ schema: scheduleSchema }),
        prompt: `Sos un maestro parrillero argentino. Armá únicamente el cronograma de cocción estructurado para ${input.people} personas en ${input.location}. Usá estas compras finales y sus cantidades: ${JSON.stringify(plan.items.map((item) => ({ name: item.name, quantity: item.quantity, unit: item.unit })))}. Empezá a las 18:00. Indicá entre 4 y 6 pasos cronológicos, contemplando encendido de carbón, cortes según sus kg, embutidos, reposo y servicio. No incluyas precios ni productos nuevos. El detalle debe ser breve y accionable.`,
      });
      if (cookingOutput?.schedule?.length) {
        plan.schedule = cookingOutput.schedule;
        plan.scheduleSource = 'ai';
      }
    } catch (error) {
      // The purchase plan remains valid even if the complementary schedule call fails.
      console.error('[generate-plan] No se pudo generar el cronograma con IA:', error instanceof Error ? error.message : 'error desconocido');
    }
    return Response.json(plan);
  } catch (error) {
    console.error('[generate-plan] No se pudo generar el plan con IA:', error instanceof Error ? error.message : 'error desconocido');
    const plan = buildPlan();
    plan.tips = ['Usamos una propuesta segura con el catálogo disponible mientras se conecta la recomendación de IA.'];
    return Response.json(plan);
  }
}
