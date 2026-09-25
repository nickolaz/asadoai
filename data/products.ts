export type Product = {
  id: string;
  name: string;
  category: 'carne' | 'embutido' | 'combustible' | 'bebida';
  unit: 'kg' | 'unidad' | 'pack';
  price: number;
  minQuantity: number;
  maxQuantity: number;
};

export const products: Product[] = [
  { id: 'vacio', name: 'Vacío', category: 'carne', unit: 'kg', price: 17500, minQuantity: 0.5, maxQuantity: 8 },
  { id: 'tira', name: 'Tira de asado', category: 'carne', unit: 'kg', price: 15000, minQuantity: 0.5, maxQuantity: 8 },
  { id: 'lomo', name: 'Lomo', category: 'carne', unit: 'kg', price: 25000, minQuantity: 0.5, maxQuantity: 5 },
  { id: 'entrania', name: 'Entraña', category: 'carne', unit: 'kg', price: 22000, minQuantity: 0.5, maxQuantity: 5 },
  { id: 'matambre', name: 'Matambre', category: 'carne', unit: 'kg', price: 16500, minQuantity: 0.5, maxQuantity: 6 },
  { id: 'colita', name: 'Colita de cuadril', category: 'carne', unit: 'kg', price: 19500, minQuantity: 0.5, maxQuantity: 6 },
  { id: 'bondiola', name: 'Bondiola', category: 'carne', unit: 'kg', price: 12500, minQuantity: 0.5, maxQuantity: 6 },
  { id: 'banderita', name: 'Asado banderita', category: 'carne', unit: 'kg', price: 14500, minQuantity: 0.5, maxQuantity: 8 },
  { id: 'chorizo', name: 'Chorizo', category: 'embutido', unit: 'unidad', price: 1200, minQuantity: 1, maxQuantity: 30 },
  { id: 'morcilla', name: 'Morcilla', category: 'embutido', unit: 'unidad', price: 1300, minQuantity: 1, maxQuantity: 20 },
  { id: 'carbon', name: 'Carbón', category: 'combustible', unit: 'kg', price: 2800, minQuantity: 1, maxQuantity: 10 },
  { id: 'bebidas', name: 'Bebidas', category: 'bebida', unit: 'pack', price: 7500, minQuantity: 1, maxQuantity: 10 },
];
