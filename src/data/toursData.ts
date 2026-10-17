export const business = {
  name: 'Tours Shaddai',
  captain: 'Captain Jorge Martinez',
  captainEs: 'Capitán Jorge Martinez',
  phone: '939-471-4747',
  phoneLink: 'tel:+19394714747',
  email: 'boattoursshaddai@gmail.com',
  emailLink: 'mailto:boattoursshaddai@gmail.com',
  facebook: 'FACEBOOK_URL_HERE',
  instagram: 'https://www.instagram.com/charteaconmigo?igsh=anJxbmM1MGxsamgy',
  logo: '/brand/Shaddailogo.png',
};

export const images = {
  hero: '/images/hero/Bote1.jpeg',
  captain: '/images/gallery/Capitan_Jorge.png',
  destinationIcacos: '/images/gallery/Bote_2.jpeg',
  destinationPalomino: '/images/gallery/Bote4.jpeg',
  destinationVieques: '/images/gallery/Bote5.jpeg',
  destinationCulebra: '/images/gallery/FLAG.jpeg',
};

export const destinations = [
  {
    key: 'icacos',
    en: { name: 'Cayo Icacos', description: "Discover clear turquoise water, white-sand beaches and the unforgettable Caribbean scenery that makes Icacos one of Puerto Rico's favorite island escapes." },
    es: { name: 'Cayo Icacos', description: 'Descubre aguas turquesas, playas de arena blanca y el paisaje caribeño que hace de Icacos uno de los escapes favoritos de Puerto Rico.' },
  },
  {
    key: 'palomino',
    en: { name: 'Palomino Island', description: 'Relax, swim and enjoy the tropical surroundings of Palomino while spending a memorable day on the water with Tours Shaddai.' },
    es: { name: 'Isla Palomino', description: 'Relájate, nada y disfruta el ambiente tropical de Palomino mientras compartes un día memorable en el mar con Tours Shaddai.' },
  },
  {
    key: 'vieques',
    en: { name: 'Vieques', description: 'Explore the laid-back charm of Vieques — pristine beaches, bioluminescent bays and a wild, natural beauty that feels worlds away from everything.' },
    es: { name: 'Vieques', description: 'Explora el encanto relajado de Vieques — playas prístinas, bahías bioluminiscentes y una belleza natural salvaje que parece estar a mundos de distancia.' },
  },
  {
    key: 'culebra',
    en: { name: 'Culebra', description: 'Snorkel world-famous Flamenco Beach, spot sea turtles and unwind on one of the most stunning islands in the Caribbean.' },
    es: { name: 'Culebra', description: 'Haz snorkeling en la mundialmente famosa Playa Flamenco, observa tortugas marinas y relájate en una de las islas más espectaculares del Caribe.' },
  },
];
export const destinationBanner = '/images/gallery/TOR.jpeg';

export type GalleryCategory = 'boat' | 'guests' | 'food' | 'sunset';

export const gallery: Array<{
  image: string;
  category: GalleryCategory;
  caption: string;
  captionEs: string;
}> = [
  { image: '/images/hero/Bote1.jpeg', category: 'boat', caption: 'The Tours Shaddai experience', captionEs: 'La experiencia Tours Shaddai' },
  { image: '/images/gallery/Bote_2.jpeg', category: 'boat', caption: 'Ready to set sail', captionEs: 'Listos para navegar' },
  { image: '/images/gallery/Bote4.jpeg', category: 'boat', caption: 'Your private Caribbean cruise', captionEs: 'Tu crucero caribeño privado' },
  { image: '/images/gallery/Bote5.jpeg', category: 'boat', caption: 'Crystal-clear waters ahead', captionEs: 'Aguas cristalinas por delante' },
  { image: '/images/gallery/GG1.jpeg', category: 'guests', caption: 'Unforgettable moments on the water', captionEs: 'Momentos inolvidables en el agua' },
  { image: '/images/gallery/GG4.jpeg', category: 'guests', caption: 'Good company, island views', captionEs: 'Buena compañía y vistas de la isla' },
  { image: '/images/gallery/GG@.jpeg', category: 'guests', caption: 'Making memories together', captionEs: 'Creando recuerdos juntos' },
  { image: '/images/gallery/GGNIGHT.jpeg', category: 'guests', caption: 'Evenings to remember', captionEs: 'Tardes para recordar' },
  { image: '/images/gallery/F1.jpeg', category: 'food', caption: 'Fresh flavors for a Caribbean day', captionEs: 'Sabores frescos para un día caribeño' },
  { image: '/images/gallery/F2.jpeg', category: 'food', caption: 'Delicious snacks included', captionEs: 'Deliciosos refrigerios incluidos' },
  { image: '/images/gallery/F5.jpeg', category: 'food', caption: 'A taste of the Caribbean', captionEs: 'Un sabor del Caribe' },
  { image: '/images/gallery/FF2.jpeg', category: 'food', caption: 'Freshly prepared on board', captionEs: 'Preparado fresco a bordo' },
  { image: '/images/gallery/FF4.jpeg', category: 'food', caption: 'Island-style dining', captionEs: 'Comida estilo isla' },
  { image: '/images/gallery/FF5.jpeg', category: 'food', caption: 'Colorful Caribbean plates', captionEs: 'Platos coloridos del Caribe' },
  { image: '/images/gallery/FF6.jpeg', category: 'food', caption: 'A feast at sea', captionEs: 'Un banquete en el mar' },
  { image: '/images/gallery/SUNS.jpeg', category: 'sunset', caption: 'Golden hour on the water', captionEs: 'Hora dorada en el agua' },
  { image: '/images/gallery/SUN2.jpeg', category: 'sunset', caption: 'Where the sky meets the sea', captionEs: 'Donde el cielo se encuentra con el mar' },
  { image: '/images/gallery/TOR.jpeg', category: 'sunset', caption: 'Caribbean sunset magic', captionEs: 'Magia del atardecer caribeño' },
  { image: '/images/gallery/TOR2.jpeg', category: 'sunset', caption: 'Colors of the Caribbean sky', captionEs: 'Colores del cielo caribeño' },
];

export const galleryCategories: Array<{ key: GalleryCategory | 'all'; en: string; es: string }> = [
  { key: 'all', en: 'All', es: 'Todo' },
  { key: 'boat', en: 'Boat', es: 'Bote' },
  { key: 'guests', en: 'Guests', es: 'Visitantes' },
  { key: 'food', en: 'Food', es: 'Comida' },
  { key: 'sunset', en: 'Sunset', es: 'Atardecer' },
];

export const sunsetImages = [
  '/images/gallery/SUNS.jpeg',
  '/images/gallery/SUN2.jpeg',
  '/images/gallery/TOR.jpeg',
  '/images/gallery/TOR2.jpeg',
];

export const reviews: Array<{ quote: string; name: string }> = [];

export const faqs = [
  { en: ['What is included with the tour?', 'Refreshments, snacks, snorkeling equipment, floating noodles, beach games and Bluetooth music connectivity are included.'], es: ['¿Qué incluye el tour?', 'Se incluyen bebidas, refrigerios, equipo de snorkeling, flotadores, juegos de playa y conexión para música Bluetooth.'] },
  { en: ['Should I bring a towel?', 'Yes. Towels are not provided.'], es: ['¿Debo traer una toalla?', 'Sí. No se proveen toallas.'] },
  { en: ['Can I bring alcoholic beverages?', 'Yes. Guests may bring their preferred alcoholic beverages, but canned beverages only.'], es: ['¿Puedo traer bebidas alcohólicas?', 'Sí. Puedes traer tus bebidas alcohólicas preferidas, pero solamente en lata.'] },
  { en: ['What type of sunscreen should I bring?', 'Use lotion sunscreen. Spray sunscreen is not permitted.'], es: ['¿Qué tipo de protector solar debo traer?', 'Utiliza protector solar en crema. No se permite protector solar en aerosol.'] },
  { en: ['Where does Tours Shaddai go?', 'Tours Shaddai offers experiences visiting Cayo Icacos, Palomino, Vieques and Culebra in Puerto Rico.'], es: ['¿A dónde va Tours Shaddai?', 'Tours Shaddai ofrece experiencias visitando Cayo Icacos, Palomino, Vieques y Culebra en Puerto Rico.'] },
  { en: ['How do I check availability?', 'Call Captain Jorge at 939-471-4747 or submit the website availability request form.'], es: ['¿Cómo verifico disponibilidad?', 'Llama al Capitán Jorge al 939-471-4747 o envía el formulario de solicitud de disponibilidad.'] },
];
