import { Suspense } from 'react';
import { PlanBuilder } from './plan-builder';

export default function PlanPage() {
  return <Suspense fallback={<main className="plan-shell">Cargando tu plan…</main>}><PlanBuilder /></Suspense>;
}
