// Booking configuration for Tours Shaddai.
// Prices here are only for display. The server (supabase/functions/_shared/tours.ts) holds the
// authoritative prices that Stripe charges, so a visitor cannot change what they pay.

export type TourId = 'icacos-4h' | 'icacos-6h' | 'culebra-7h' | 'vieques-7h';

export interface Tour {
  id: TourId;
  hours: number;
  price: number; // USD, whole boat (six-pack license, up to 6 passengers)
  startTimes: string[]; // local Puerto Rico time, 24h "HH:MM"
  en: { name: string; short: string };
  es: { name: string; short: string };
}

export const MAX_PASSENGERS = 6;
export const TIMEZONE = 'America/Puerto_Rico';
export const COMPANY_EMAIL = 'boattoursshaddai@gmail.com';

export const tours: Tour[] = [
  {
    id: 'icacos-4h', hours: 4, price: 650, startTimes: ['08:00', '13:00'],
    en: { name: 'Icacos or Palomino · 4 hours', short: 'Half-day island escape with swimming and snorkeling.' },
    es: { name: 'Icacos o Palomino · 4 horas', short: 'Medio día de isla con playa y snorkeling.' },
  },
  {
    id: 'icacos-6h', hours: 6, price: 950, startTimes: ['09:00'],
    en: { name: 'Icacos or Palomino · 6-hour full day', short: 'A relaxed full day on the water and the beach.' },
    es: { name: 'Icacos o Palomino · Día completo 6 horas', short: 'Un día completo y relajado en el agua y la playa.' },
  },
  {
    id: 'culebra-7h', hours: 7, price: 1450, startTimes: ['08:00'],
    en: { name: 'Culebra Island · 7 hours', short: 'Cross to Culebra for world-famous beaches and reefs.' },
    es: { name: 'Isla de Culebra · 7 horas', short: 'Cruza a Culebra por sus playas y arrecifes famosos.' },
  },
  {
    id: 'vieques-7h', hours: 7, price: 1450, startTimes: ['08:00'],
    en: { name: 'Vieques Island · 7 hours', short: 'Explore the beaches and clear waters of Vieques.' },
    es: { name: 'Isla de Vieques · 7 horas', short: 'Explora las playas y aguas cristalinas de Vieques.' },
  },
];

// Draft terms for the captain to review before launch.
export const terms = {
  en: [
    'Private charter for up to 6 passengers (USCG six-pack license). The price covers the whole boat, not per person.',
    'Full payment is required to confirm your date. Your date is reserved only after payment is completed.',
    'Every passenger must sign the waiver before payment. Minors must be signed for by a parent or legal guardian.',
    'Please arrive 15 minutes before departure. Late arrivals may shorten the trip time.',
    'If the Captain cancels for weather or sea conditions, you may reschedule or receive a full refund.',
    'Cancellations by the guest: please contact us. Refunds follow the policy shared at booking confirmation.',
    'Canned beverages only. Spray sunscreen is not allowed; please use lotion sunscreen. Towels are not provided.',
    'The Captain may end the trip without refund for illegal, unsafe or dangerous behavior.',
  ],
  es: [
    'Viaje privado hasta 6 pasajeros (licencia six-pack de la Guardia Costera). El precio es por el bote completo, no por persona.',
    'Se requiere el pago completo para confirmar la fecha. La fecha queda reservada solo después de completar el pago.',
    'Todos los pasajeros deben firmar el relevo antes del pago. Los menores deben ser firmados por su padre, madre o tutor legal.',
    'Llega 15 minutos antes de la salida. Las llegadas tarde pueden acortar el tiempo del viaje.',
    'Si el Capitán cancela por clima o condiciones del mar, puedes reprogramar o recibir un reembolso completo.',
    'Cancelaciones del cliente: contáctanos. Los reembolsos siguen la política compartida en la confirmación.',
    'Solo bebidas en lata. No se permite protector solar en aerosol; usa crema. No se proveen toallas.',
    'El Capitán puede terminar el viaje sin reembolso por conducta ilegal, insegura o peligrosa.',
  ],
};

// Waiver texts provided by Tours Shaddai (summary sheet + full release). Shown together; both are accepted and signed.
export const waiverSummary = [
  'I understand there are risks with boating, snorkeling, swimming, boarding or leaving the vessel and visiting islands. These include injuries, illness, equipment failure, bad weather, wildlife, other boats, and actions of other people.',
  'I take full responsibility for my own safety and belongings during the trip, both on the boat and on shore.',
  'I understand Tours Shaddai does not provide insurance for my property, medical care, evacuation, trip delays, or cancellations. I am responsible for getting my own coverage if I want it.',
  'I am physically able to take part in these activities and have no medical issues that would make them unsafe for me.',
  'I understand medical help may be delayed until we reach land.',
  'I will follow all instructions from the Captain and crew, and I will comply with all laws. Illegal behavior or dangerous conduct can end my trip without a refund.',
  'I release Tours Shaddai and everyone working for them from all claims, lawsuits, or demands related to this trip, even if caused by negligence.',
  'I allow Tours Shaddai to use photos or videos of me for marketing without payment.',
];

export const waiverFullIntro = 'I understand that the purpose of signing this document is to exempt and release Boat Tours El Shaddai, their owners, employees, agents, associated personnel, and their boats (whether owned, operated, leased, or chartered), hereinafter referred to as "Released Parties", and to hold these entities harmless from any and all liabilities arising as a consequence of the following, or any other acts or omissions on their part, including but not limited to negligence of any type.';

export const waiverFull = [
  'I understand that there are inherent risks involved with boating, swimming, snorkeling, and associated water-related activities, including but not limited to equipment failure, perils of the sea, harm caused by marine creatures (including bites), acts of fellow participants, entering and exiting water, boarding or disembarking boats, transiting the vessel, activities on the docks, and all other related activities. I hereby assume such risks.',
  'I understand that I have a duty to exercise reasonable care for my own safety, and I agree to do so.',
  'I assert that I am physically fit to ride on a boat, swim, snorkel, or any other related activities, and I will not hold the Released Parties responsible if I am injured as a result of any problems (medical, accidental, or otherwise) which occur while riding on the boat, swimming, snorkeling or any other related activities or otherwise participating in the trip.',
  'I acknowledge and understand that a flotation device is available for my use at any time during the trip, whether on the boat or in the water.',
  'If I become distressed while on the boat or in the water, I will immediately alert any and all nearby personnel or vessels for assistance. I acknowledge that failure to do so will constitute a violation of safety rules and procedures for which I expressly assume the risk.',
  'I fully understand that the involved boat has limited medical facilities and that in the event of illness or injury, appropriate medical care must be summoned by radio, and treatment will be delayed until I can be transported to a proper medical facility. I agree in advance to these conditions.',
  'The participating boat has made no representation to me, implied or otherwise, that they or their crew can or will perform safe rescues or render first aid. In the event I show signs of distress or call for aid, I would like assistance and will not hold the Released Parties, their crew, boats, or passengers responsible for their actions in attempting the performance of rescue or first aid.',
  'It is my intention by this instrument to give up my right to sue all persons or entities referred to herein, whether specifically named or not, and it is also my intention to exempt and release all Released Parties and to hold these entities harmless from any and all liability for personal injury, property damage, or wrongful death caused by negligence or gross negligence and I assume all risk in connection with boating and in-water activities, including but not limited to the maintenance of the equipment or organization of this, or any related activity.',
  'I have carefully read this contract in its entirety, and I fully understand its contents and agree to the terms and conditions of this contract on behalf of myself, my heirs, and my personal representatives. This document constitutes the final and entire agreement between Released Parties and the undersigned; there are no warranties expressed or implied which extend beyond the description of the activity listed on this form. This is a complete release of liability and a legally binding contract.',
  'I grant Boat Tours El Shaddai, its representatives and employees, the right to take photographs of me and my property in connection with the above-identified subject. I authorize Boat Tours El Shaddai, its assigns, and transferees to copyright, use, and publish the same in print and/or electronically. I agree that Boat Tours El Shaddai may use such photographs of me with or without my name and for any lawful purpose, including, for example, such a purpose as publicity, illustration, advertising, and web content.',
  'By signing below as a parent or guardian, I acknowledge that I am signing this document on behalf of my minor child and on behalf of all the child\'s parents and guardians, and we agree to be specifically bound to all the terms and conditions of this waiver and release of liability, assumption of risk and indemnity.',
];

export const waiverClosing = 'I have read this agreement, and I am aware that it is a release of liability and a contract between myself and the Released Parties. I sign it of my own free will and agree to be bound by it from the date of my signature forever into the future.';
