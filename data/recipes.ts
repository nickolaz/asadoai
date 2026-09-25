export const recipes = [
  {
    id: 'criolla', name: 'Ensalada criolla', category: 'Ensaladas', minutes: 15, difficulty: 'Fácil',
    summary: 'Fresca, ácida y lista en minutos para equilibrar las carnes de la parrilla.',
    ingredients: ['2 tomates firmes', '1 cebolla morada', '1 morrón verde', 'Perejil fresco', 'Aceite, vinagre y sal'],
    steps: ['Cortá tomates, cebolla y morrón en tiras o cubos parejos.', 'Mezclá con perejil picado.', 'Condimentá justo antes de servir para mantenerla crocante.'],
  },
  {
    id: 'provoleta', name: 'Provoleta a la parrilla', category: 'Acompañamientos', minutes: 20, difficulty: 'Fácil',
    summary: 'Queso dorado por fuera y bien fundido por dentro, directo de la parrilla a la mesa.',
    ingredients: ['1 provoleta de 500 g', 'Orégano seco', 'Ají molido', 'Aceite de oliva', 'Pan de campo'],
    steps: ['Llevá la provoleta a una provoletera o plancha caliente.', 'Cociná hasta dorar la base y darla vuelta con cuidado.', 'Terminá con orégano, ají molido y un hilo de oliva.'],
  },
  {
    id: 'papas', name: 'Papas al plomo', category: 'Acompañamientos', minutes: 40, difficulty: 'Media',
    summary: 'Papas suaves por dentro, perfumadas con manteca y hierbas, cocidas entre las brasas.',
    ingredients: ['4 papas medianas', 'Manteca', 'Perejil', 'Sal gruesa', 'Papel aluminio'],
    steps: ['Lavá las papas y envolvelas individualmente en aluminio.', 'Cocinalas cerca de las brasas hasta que estén tiernas.', 'Abrilas, sumá manteca, perejil y sal gruesa antes de servir.'],
  },
  {
    id: 'chimichurri', name: 'Chimichurri casero', category: 'Salsas', minutes: 10, difficulty: 'Fácil',
    summary: 'La salsa infaltable: intensa, fresca y perfecta para acompañar cualquier corte.',
    ingredients: ['Perejil fresco', 'Orégano seco', 'Ajo', 'Ají molido', 'Vinagre de vino', 'Aceite de oliva'],
    steps: ['Picá fino el perejil y el ajo.', 'Mezclá con orégano, ají molido, vinagre y aceite.', 'Dejalo reposar al menos diez minutos para integrar sabores.'],
  },
] as const;
