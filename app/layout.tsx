import type { Metadata } from 'next';
import 'mapbox-gl/dist/mapbox-gl.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Asado.ai — Tu asado, más fácil',
  description: 'Planificá tu asado con una lista de compra y tiempos de cocción.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-AR"><body>{children}</body></html>;
}
