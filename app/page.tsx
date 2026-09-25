import { Beef, Flame, MapPin, Sparkles, Users, WalletCards } from 'lucide-react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function Home() {
  return <main className="start-page">
    <section className="start-card">
      <nav><a className="wordmark" href="#inicio"><b><Flame aria-hidden /></b><span>Asado.ai<small>Tu asado, más fácil.</small></span></a><span className="location"><MapPin aria-hidden size={13} /> CABA</span></nav>
      <div className="start-copy" id="inicio"><p className="start-note">El asado perfecto<br />existe ↘</p><h1><em>Decile a la IA</em><br />qué querés, y te armamos<br />el asado perfecto.</h1><p>Cortes, cantidades, precios, carnicerías cercanas, recetas y más. Todo en un solo lugar.</p></div>
      <form className="start-form" action={`${basePath}/plan`} method="get">
        <label><b><Users aria-hidden size={15} /></b><span>¿Cuántas personas son?<input name="people" type="number" min="1" max="30" defaultValue="8" required /></span></label>
        <label><b><WalletCards aria-hidden size={15} /></b><span>¿Cuál es tu presupuesto?<input name="budget" type="number" min="10000" defaultValue="80000" required /></span></label>
        <label><b><MapPin aria-hidden size={15} /></b><span>¿Dónde estás?<input name="location" defaultValue="CABA" required /></span></label>
        <button className="coral-button">Generar plan →</button>
      </form>
    </section>
    <section className="start-benefits" id="como-funciona"><div><b><Sparkles aria-hidden size={16} /></b><p>Optimizamos tu presupuesto para que alcance mejor.</p></div><div><b><MapPin aria-hidden size={16} /></b><p>Carnicerías y ofertas de demostración cerca tuyo.</p></div><div><b><Beef aria-hidden size={16} /></b><p>Cortes, recetas y tiempos sin complicaciones.</p></div></section>
  </main>;
}
