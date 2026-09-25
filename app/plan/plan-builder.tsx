'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft, BadgeDollarSign, BookOpen, ChefHat, CircleCheck, Flame, Info, MapPin,
  LoaderCircle, Pencil, Share2, ShoppingCart, Timer, Users, WalletCards, X,
} from 'lucide-react';
import { imageSources } from '@/data/images';
import { savedLocations } from '@/data/locations';
import type { MapLocation } from '@/data/map-locations';
import { products } from '@/data/products';
import { recipes } from '@/data/recipes';
import { ButcheryMap } from './butchery-map';

type Plan = {
  input: { people: number; budget: number; location: string };
  items: { id: string; name: string; unit: string; quantity: number; subtotal: number }[];
  total: number;
  remainingBudget: number;
  tips: string[];
  schedule: { time: string; action: string; detail?: string }[];
  scheduleSource?: 'ai' | 'fallback';
  priceSource?: { source: string; sourceUrl: string; updatedAt: string };
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const imageForProduct = (id: string) => imageSources.products[id as keyof typeof imageSources.products] ?? imageSources.cuts[id as keyof typeof imageSources.cuts] ?? '/images/asado-cuts.png';
const imageForRecipe = (id: string) => imageSources.recipes[id as keyof typeof imageSources.recipes] ?? '/images/asado-recipes.png';
const fallback: Plan = {
  input: { people: 8, budget: 80000, location: 'CABA' },
  items: [
    { id: 'vacio', name: 'Vacío (asado)', quantity: 1.6, unit: 'kg', subtotal: 28800 },
    { id: 'tira', name: 'Tira de asado', quantity: 0.8, unit: 'kg', subtotal: 18400 },
    { id: 'chorizo', name: 'Chorizo', quantity: 8, unit: 'u', subtotal: 9600 },
    { id: 'morcilla', name: 'Morcilla', quantity: 4, unit: 'u', subtotal: 5200 },
    { id: 'carbon', name: 'Carbón', quantity: 2, unit: 'kg', subtotal: 4400 },
    { id: 'bebidas', name: 'Bebidas (vino + gaseosa)', quantity: 2, unit: 'botellas + 3 L', subtotal: 7020 },
  ],
  total: 76420,
  remainingBudget: 3580,
  tips: ['Dejá reposar la carne diez minutos antes de cortar.'],
  scheduleSource: 'fallback',
  schedule: [
    { time: '18:00', action: 'Encender el carbón' },
    { time: '18:30', action: 'Poner la carne (vacío y tira)' },
    { time: '19:00', action: 'Chorizos y morcillas' },
    { time: '19:20', action: 'Dar vuelta la carne' },
    { time: '19:40', action: 'Retirar y dejar reposar' },
    { time: '20:00', action: '¡A disfrutar!' },
  ],
};

export function PlanBuilder() {
  const params = useSearchParams();
  const requestedPeople = Number(params.get('people'));
  const requestedBudget = Number(params.get('budget'));
  const requestedLocation = params.get('location')?.trim();
  const hasRequestedPlan = Number.isInteger(requestedPeople) && requestedPeople >= 1 && requestedBudget >= 10000 && Boolean(requestedLocation);
  const [plan, setPlan] = useState<Plan>(fallback);
  const [loading, setLoading] = useState(hasRequestedPlan);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(false);
  const [sortDirection, setSortDirection] = useState<'az' | 'za'>('za');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [showAllRecipes, setShowAllRecipes] = useState(false);
  const [showPriceInfo, setShowPriceInfo] = useState(false);
  const [nearbyLocations, setNearbyLocations] = useState<MapLocation[]>([]);
  const [userCoordinates, setUserCoordinates] = useState<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = useState('Buscando tu ubicación…');
  const [selectedMapLocationId, setSelectedMapLocationId] = useState<string>(savedLocations[0].id);
  const latestPlanRequest = useRef(0);

  const requestPlan = useCallback(async (input: Plan['input'], signal?: AbortSignal) => {
    const requestId = ++latestPlanRequest.current;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${basePath}/api/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal,
      });
      const generatedPlan = await response.json();
      if (!response.ok) throw new Error(generatedPlan.error);
      if (requestId === latestPlanRequest.current) setPlan(generatedPlan);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
      if (requestId === latestPlanRequest.current) setError('Mostramos un plan de ejemplo mientras intentamos generar el tuyo.');
    } finally {
      if (requestId === latestPlanRequest.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasRequestedPlan || !requestedLocation) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    void requestPlan({ people: requestedPeople, budget: requestedBudget, location: requestedLocation }, controller.signal);
    return () => {
      latestPlanRequest.current += 1;
      controller.abort();
    };
  }, [hasRequestedPlan, requestPlan, requestedBudget, requestedLocation, requestedPeople]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('Tu navegador no permite ubicación precisa.');
      return;
    }
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const coordinates: [number, number] = [coords.longitude, coords.latitude];
      setUserCoordinates(coordinates);
      setLocationStatus('Ubicación precisa activa.');
      try {
        const response = await fetch(`${basePath}/api/nearby-locations`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ longitude: coords.longitude, latitude: coords.latitude }),
        });
        const data = await response.json() as { locations?: MapLocation[] };
        if (response.ok) setNearbyLocations(data.locations ?? []);
      } catch {
        setLocationStatus('Mostramos las ubicaciones seed de CABA.');
      }
    }, () => setLocationStatus('Usamos CABA porque no compartiste ubicación.'), { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 });
  }, []);

  const selectedRecipe = recipes.find((recipe) => recipe.id === selectedRecipeId);
  const displayedRecipes = showAllRecipes ? recipes : recipes.slice(0, 3);
  // The local directory provides a reliable baseline of map points. Browser
  // geolocation only augments that data; it never decides whether pins appear.
  const mapLocations = useMemo(() => [...savedLocations, ...nearbyLocations], [nearbyLocations]);
  const sortedMapLocations = useMemo(() => [...mapLocations].sort((left, right) => {
    const direction = sortDirection === 'az' ? 1 : -1;
    return direction * `${left.name} ${left.address}`.localeCompare(`${right.name} ${right.address}`, 'es');
  }), [mapLocations, sortDirection]);
  function scrollTo(id: string) {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function adjustQuantity(id: string, amount: number) {
    setPlan((currentPlan) => {
      const items = currentPlan.items.map((item) => {
        if (item.id !== id) return item;
        const product = products.find((candidate) => candidate.id === id);
        const minQuantity = product?.minQuantity ?? 0.5;
        const maxQuantity = product?.maxQuantity ?? 30;
        const quantity = Math.min(maxQuantity, Math.max(minQuantity, item.quantity + amount));
        return { ...item, quantity, subtotal: Math.round(item.subtotal * quantity / item.quantity) };
      });
      const total = items.reduce((sum, item) => sum + item.subtotal, 0);
      return { ...currentPlan, items, total, remainingBudget: currentPlan.input.budget - total };
    });
  }

  function quantityStep(id: string) {
    return products.find((product) => product.id === id)?.unit === 'kg' ? 0.5 : 1;
  }

  function atQuantityLimit(id: string, quantity: number, direction: 'min' | 'max') {
    const product = products.find((candidate) => candidate.id === id);
    return direction === 'min' ? quantity <= (product?.minQuantity ?? 0.5) : quantity >= (product?.maxQuantity ?? 30);
  }

  async function sharePlan() {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Mi plan de Asado.ai', url: window.location.href });
        setNotice('Plan compartido.');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setNotice('Link del plan copiado.');
      }
    } catch {
      setNotice('No pudimos compartir el plan.');
    }
  }

  function selectMapLocation(locationId: string) {
    setSelectedMapLocationId(locationId);
    const location = mapLocations.find((item) => item.id === locationId);
    setNotice(location ? `${location.name} marcado en el mapa.` : 'Marcamos el lugar seleccionado en el mapa.');
  }

  return (
    <main className="generated-page">
      <header className="generated-nav">
        <a href={`${basePath}/`} className="generated-brand"><Flame /><span>Asado.ai<small>Tu asado, más fácil.</small></span></a>
        <span><MapPin size={15} /> {plan.input.location}</span>
      </header>

      <div className="generated-wrap">
        <div className="generated-back">
          <a href={`${basePath}/`}><ArrowLeft size={16} /> Volver</a>
          <button onClick={sharePlan}><Share2 size={15} /> Compartir plan</button>
        </div>
        {notice && <p className="generated-notice" role="status">{notice}</p>}
        <section className="generated-hero">
          <div><h1>Resultado de tu plan</h1><p>Basado en {plan.input.people} personas, un presupuesto de {money.format(plan.input.budget)} y tu ubicación en {plan.input.location}.<br />Aquí tenés la mejor opción para tu asado.</p></div>
          <div className="stat-grid"><Stat icon={<Users />} label="Personas" value={String(plan.input.people)} /><Stat icon={<WalletCards />} label="Presupuesto" value={money.format(plan.input.budget)} /><Stat icon={<BadgeDollarSign />} label="Costo estimado" value={money.format(plan.total)} withinBudget={plan.remainingBudget >= 0} /></div>
        </section>
        <div className="generated-tabs" aria-label="Secciones del plan">
          <button onClick={() => scrollTo('#compra')} className="active"><ShoppingCart /> Lista de compra</button><button onClick={() => scrollTo('#carnicerias')}><MapPin /> Carnicerías cercanas</button><button onClick={() => scrollTo('#coccion')}><ChefHat /> Plan de cocción</button><button onClick={() => scrollTo('#recetas')}><BookOpen /> Recetas</button>
        </div>
        {error && <p className="generated-error">{error}</p>}

        <section className="generated-main">
          <article className="purchase-card" id="compra">
            <header><div><ShoppingCart /><span><h2>Lista de compra</h2><p>Todos los cortes, cantidades y demás que necesitás.</p></span></div><button onClick={() => setEditing((value) => !value)}><Pencil size={14} /> {editing ? 'Guardar lista' : 'Editar lista'}</button></header>
            <div className="live-price-note">{plan.priceSource ? <>Precios de cortes consultados en <a href={plan.priceSource.sourceUrl} target="_blank" rel="noreferrer">{plan.priceSource.source}</a> · {new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(plan.priceSource.updatedAt))}</> : <>Precios orientativos mientras se actualiza la fuente.</>}<button aria-label="Ver fuentes y locales consultados" aria-expanded={showPriceInfo} onClick={() => setShowPriceInfo((value) => !value)}><Info /></button>{showPriceInfo && <aside className="price-info-popover"><b>Fuentes y locales</b><p>{plan.priceSource ? <><a href={plan.priceSource.sourceUrl} target="_blank" rel="noreferrer">Disco</a>: precios vivos de cortes.</> : 'Disco: fuente configurada para precios de cortes.'}</p><p>Coto y Disco, junto con carnicerías RES, se buscan alrededor de tu ubicación y aparecen en el mapa.</p><small>Los extras conservan precio orientativo.</small></aside>}</div>
            <div className="purchase-table"><div className="purchase-head"><span>Producto</span><span>Cantidad</span><span>Precio estimado</span></div>{plan.items.map((item) => { const step = quantityStep(item.id); return <div className="purchase-row" key={item.id}><img src={imageForProduct(item.id)} alt={item.name} /><b>{item.name}</b><span className={editing ? 'editing-quantity' : ''}>{editing ? <><button onClick={() => adjustQuantity(item.id, -step)} disabled={atQuantityLimit(item.id, item.quantity, 'min')} aria-label={`Quitar ${item.name}`}>−</button>{item.quantity} {item.unit}<button onClick={() => adjustQuantity(item.id, step)} disabled={atQuantityLimit(item.id, item.quantity, 'max')} aria-label={`Sumar ${item.name}`}>+</button></> : <>{item.quantity} {item.unit}</>}</span><strong>{money.format(item.subtotal)}</strong></div>; })}</div>
            <div className="total-strip"><BadgeDollarSign /><span><b>Costo total estimado</b><small>{plan.tips[0] ?? 'Este plan se ajusta a tu presupuesto.'}</small></span><strong>{money.format(plan.total)}<small className={plan.remainingBudget >= 0 ? 'within-budget' : 'over-budget'}><CircleCheck size={14} /> {plan.remainingBudget >= 0 ? 'Dentro de tu presupuesto' : 'Excede tu presupuesto'}</small></strong></div>
          </article>

          <aside className="butcher-card" id="carnicerias">
            <header><MapPin /><span><h2>Puntos cercanos</h2><p>{locationStatus} · {mapLocations.length} puntos visibles en el mapa.</p></span><button onClick={() => setSortDirection((value) => value === 'az' ? 'za' : 'az')}>Ordenar: {sortDirection === 'az' ? 'A–Z' : 'Z–A'}⌄</button></header>
            <div className="butcher-body"><div className="map-location-list">{sortedMapLocations.map((location) => <button type="button" className={`store map-location-item ${selectedMapLocationId === location.id ? 'selected' : ''}`} key={location.id} onClick={() => selectMapLocation(location.id)}><MapPin aria-hidden="true" /><section><b>{location.name}</b><small>{location.address}</small><span>{location.kind === 'butcher' ? 'Carnicería señalada en el mapa' : 'Comercio de referencia señalado en el mapa'}</span></section></button>)}</div><ButcheryMap locations={mapLocations} userCoordinates={userCoordinates} selectedLocationId={selectedMapLocationId} onSelect={selectMapLocation} /></div>
          </aside>
        </section>

        <section className="generated-bottom">
          <article className="timeline-card" id="coccion"><header><ChefHat /><span><h2>Plan de cocción</h2><p>{plan.scheduleSource === 'ai' ? 'Cronograma generado por IA según cortes, kilos y comensales.' : 'Cronograma base mientras la IA no esté disponible.'}</p></span>{plan.scheduleSource !== 'ai' && !loading && <button className="retry-ai" onClick={() => void requestPlan(plan.input)}>Reintentar con IA</button>}</header><div className="timeline">{plan.schedule.map((step) => <div key={step.time}><Timer /><b>{step.time}</b><strong>{step.action}</strong><small>{step.detail ?? 'Controlá el fuego y disfrutá del proceso.'}</small></div>)}</div></article>
          <article className="recommended-card" id="recetas"><header><BookOpen /><span><h2>Recetas recomendadas</h2><p>Ideas para que tu asado sea completo.</p></span><button onClick={() => setShowAllRecipes((value) => !value)}>{showAllRecipes ? 'Ver menos recetas' : 'Ver todas las recetas'} →</button></header><div>{displayedRecipes.map((recipe) => <button className="recipe-tile" onClick={() => setSelectedRecipeId(recipe.id)} key={recipe.id}><img src={imageForRecipe(recipe.id)} alt={`${recipe.name}, acompañamiento para asado`} /><span><b>{recipe.name}</b><small>{recipe.minutes} min · {recipe.difficulty}</small></span></button>)}</div></article>
        </section>
        {loading && <div className="plan-loading-backdrop" role="status" aria-live="polite" aria-busy="true"><div className="plan-loading"><LoaderCircle aria-hidden="true" /><strong>La IA está armando tu asado</strong><span>Consultamos precios, definimos los cortes y calculamos el cronograma.</span></div></div>}
      </div>

      {selectedRecipe && <div className="store-dialog-backdrop" role="presentation" onMouseDown={() => setSelectedRecipeId(null)}><section className="recipe-dialog" role="dialog" aria-modal="true" aria-labelledby="recipe-detail-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" onClick={() => setSelectedRecipeId(null)} aria-label="Cerrar receta"><X /></button><img src={imageForRecipe(selectedRecipe.id)} alt={selectedRecipe.name} /><div><p className="recipe-kicker">{selectedRecipe.category} · {selectedRecipe.minutes} min · {selectedRecipe.difficulty}</p><h2 id="recipe-detail-title">{selectedRecipe.name}</h2><p>{selectedRecipe.summary}</p><h3>Ingredientes</h3><ul>{selectedRecipe.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul><h3>Preparación</h3><ol>{selectedRecipe.steps.map((step) => <li key={step}>{step}</li>)}</ol></div></section></div>}
    </main>
  );
}

function Stat({ icon, label, value, withinBudget }: { icon: React.ReactNode; label: string; value: string; withinBudget?: boolean }) {
  return <article><b>{icon}</b><span>{label}<strong>{value}</strong>{withinBudget !== undefined && <small className={withinBudget ? 'within-budget' : 'over-budget'}><CircleCheck size={13} /> {withinBudget ? 'Dentro de tu presupuesto' : 'Excede tu presupuesto'}</small>}</span></article>;
}
