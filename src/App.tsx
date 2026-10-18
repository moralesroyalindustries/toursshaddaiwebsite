import { FormEvent, useEffect, useState } from 'react';
import { Anchor, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Beer, CalendarDays, Check, ChevronDown, CircleUserRound, Compass, Fish, GlassWater, Instagram, Leaf, Loader as Loader2, Mail, MapPin, Menu, Music2, Phone, Send, ShipWheel, Snowflake, Sparkles, Sun, Sunrise, Users, Utensils, Waves, X } from 'lucide-react';

function WhatsApp({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
}
import { business, destinationBanner, destinations, faqs, gallery, galleryCategories, GalleryCategory, images, reviews, sunsetImages } from '@/data/toursData';
import { supabase } from '@/lib/supabase';

type Language = 'en' | 'es';
const copy = {
  en: {
    nav: ['Experience', 'Destinations', "What's Included", 'Gallery', 'Paradise', 'Before You Go', 'FAQ', 'Contact'],
    eyebrow: 'Puerto Rico Private Boat Experience', title: 'Escape to Island Paradise', hero: 'Spend the day exploring crystal-clear Caribbean waters, beautiful beaches and unforgettable island scenery with Tours Shaddai.', heroSub: 'Your island adventure starts with Captain Jorge Martinez.', book: 'Book Your Tour', call: 'Call Captain Jorge', explore: 'Explore the experience', introTitle: 'Your Caribbean Day Starts Here', intro: "Leave the ordinary behind and experience some of Puerto Rico's most beautiful waters with Tours Shaddai. Captain Jorge Martinez takes guests to spectacular destinations including Cayo Icacos, Palomino, Vieques and Culebra for a relaxing day filled with swimming, snorkeling, food, music and island scenery.", plan: 'Plan Your Trip', destinationsTitle: 'Four Incredible Destinations', destinationsSub: 'One unforgettable day, four beautiful ways to experience the Caribbean.', includesTitle: 'Everything You Need for a Great Day', includesSub: 'Thoughtful details are ready for you before you even step aboard.', beforeTitle: 'Before You Go', beforeSub: 'A few things to bring for the perfect day on the water.', timelineTitle: 'Your Day with Tours Shaddai', whyTitle: 'Made for the Way You Want to Feel', captainTitle: 'Meet Captain Jorge Martinez', captainText: "Captain Jorge Martinez welcomes guests aboard Tours Shaddai for an unforgettable day exploring Puerto Rico's beautiful coastal waters. From Icacos to Culebra, the goal is simple: create a relaxed, enjoyable experience you'll remember long after your trip.", galleryTitle: 'Postcards from the water', gallerySub: 'Real moments from Tours Shaddai — more island memories coming soon.', paradiseTitle: 'Explore Paradise & Natural Life', paradiseSub: 'Creating memories that last a lifetime. From golden sunsets over the Caribbean to pristine beaches and untouched landscapes, every moment with Tours Shaddai is an invitation to reconnect with nature.', contactTitle: 'Ready for Your Island Escape?', contactText: 'Contact Captain Jorge to check availability and plan your Tours Shaddai experience.', request: 'Availability request', confirmation: 'Submitting this form is an availability request and does not guarantee a reservation until confirmed by Tours Shaddai.', send: 'Send Request', name: 'Full Name', phone: 'Phone Number', email: 'Email', destination: 'Preferred Destination', date: 'Preferred Date', guests: 'Number of Guests', message: 'Message', choose: 'Choose a destination', notSure: 'Not Sure Yet', callNow: 'Call Now', whatsapp: 'WhatsApp', sendEmail: 'Send Email', reviews: 'Guest Reviews Coming Soon', footerCta: 'Plan Your Island Adventure', allRights: 'All Rights Reserved.', includedNote: 'Guests are welcome to bring additional alcoholic beverages. Canned beverages only.', notice: 'Towels are not provided.', sunscreen: 'Please use lotion sunscreen only. Spray sunscreen is not permitted.', close: 'Close gallery', previous: 'Previous image', next: 'Next image', scrollExplore: 'Scroll to explore', captainLed: 'Captain-Led', feelingKicker: 'The Tours Shaddai feeling', islandsAwait: 'The islands await', destinationLabel: 'Destination', preparedKicker: 'Thoughtfully prepared', localKnowledge: 'A little local knowledge', comePrepared: 'Come prepared. Leave inspired.', shoreToShore: 'From shore to shore', betterBoatDay: 'A better kind of boat day', whyText: 'Private, unhurried and shaped around the moments you came to Puerto Rico for.', personBehind: 'The person behind the experience', captainStamp: 'Captain-led island days', glimpseKicker: 'A glimpse of the day', seaLife: 'Sea Life', naturalBeauty: 'Natural beauty', nextDayWater: 'Your next day on the water', goodToKnow: 'Good to know', questionsAnswered: 'Questions, answered.', feelReady: 'Everything you need to feel ready for your day at sea.', dayToRemember: 'Make it a day to remember', contactCaptain: 'Contact Captain Jorge', exploreFooter: 'Explore', required: 'Requerido', sent: 'Thank you. Captain Jorge will contact you soon.'
  },
  es: {
    nav: ['Experiencia', 'Destinos', 'Qué incluye', 'Galería', 'Paraíso', 'Antes de salir', 'Preguntas', 'Contacto'],
    eyebrow: 'Experiencia Privada en Bote · Puerto Rico', title: 'Descubre el Paraíso Isleño', hero: 'Disfruta un día navegando por aguas cristalinas, playas espectaculares y algunos de los destinos más hermosos de Puerto Rico con Tours Shaddai.', heroSub: 'Tu aventura comienza con el Capitán Jorge Martinez.', book: 'Reserva tu Tour', call: 'Llama al Capitán Jorge', explore: 'Conoce la experiencia', introTitle: 'Tu día en el Caribe comienza aquí', intro: 'Escápate de la rutina y disfruta algunas de las aguas más hermosas de Puerto Rico con Tours Shaddai. El Capitán Jorge Martinez lleva a sus visitantes a destinos espectaculares como Cayo Icacos, Palomino, Vieques y Culebra para disfrutar de un día de playa, snorkeling, comida, música y paisajes inolvidables.', plan: 'Planifica tu aventura', destinationsTitle: 'Cuatro destinos increíbles', destinationsSub: 'Un día inolvidable, cuatro maneras hermosas de vivir el Caribe.', includesTitle: 'Todo lo necesario para disfrutar tu día', includesSub: 'Cada detalle está listo para ti antes de subir a bordo.', beforeTitle: 'Antes de salir', beforeSub: 'Algunas cosas que recomendamos traer para disfrutar al máximo tu día.', timelineTitle: 'Tu día con Tours Shaddai', whyTitle: 'Diseñado para que disfrutes', captainTitle: 'Conoce al Capitán Jorge Martinez', captainText: 'El Capitán Jorge Martinez recibe a sus visitantes a bordo de Tours Shaddai para disfrutar un día inolvidable explorando las hermosas costas de Puerto Rico. De Icacos a Culebra, el objetivo es sencillo: crear una experiencia relajada y memorable.', galleryTitle: 'Postales desde el mar', gallerySub: 'Momentos reales de Tours Shaddai — más memorias de la isla próximamente.', paradiseTitle: 'Explora el Paraíso y la Vida Natural', paradiseSub: 'Creando memorias que duran toda la vida. Desde atardeceres dorados sobre el Caribe hasta playas prístinas y paisajes intactos, cada momento con Tours Shaddai es una invitación a reconectarte con la naturaleza.', contactTitle: '¿Listo para tu escape a la isla?', contactText: 'Contacta al Capitán Jorge para verificar disponibilidad y planificar tu experiencia Tours Shaddai.', request: 'Solicitud de disponibilidad', confirmation: 'Enviar este formulario es una solicitud de disponibilidad. La reservación queda confirmada solamente después de recibir confirmación de Tours Shaddai.', send: 'Enviar solicitud', name: 'Nombre completo', phone: 'Número de teléfono', email: 'Correo electrónico', destination: 'Destino preferido', date: 'Fecha preferida', guests: 'Número de visitantes', message: 'Mensaje', choose: 'Selecciona un destino', notSure: 'Aún no estoy seguro', callNow: 'Llamar ahora', whatsapp: 'WhatsApp', sendEmail: 'Enviar correo', reviews: 'Reseñas de visitantes próximamente', footerCta: 'Planifica tu aventura', allRights: 'Todos los derechos reservados.', includedNote: 'Los huéspedes pueden traer bebidas alcohólicas adicionales. Solamente bebidas en lata.', notice: 'No se proveen toallas.', sunscreen: 'Utiliza protector solar en crema. No se permite protector solar en aerosol.', close: 'Cerrar galería', previous: 'Imagen anterior', next: 'Imagen siguiente', scrollExplore: 'Desliza para explorar', captainLed: 'Con capitán', feelingKicker: 'La sensación Tours Shaddai', islandsAwait: 'Las islas te esperan', destinationLabel: 'Destino', preparedKicker: 'Preparado con detalle', localKnowledge: 'Un poco de conocimiento local', comePrepared: 'Ven preparado. Vete inspirado.', shoreToShore: 'De costa a costa', betterBoatDay: 'Un mejor día en el barco', whyText: 'Privado, sin prisa y diseñado alrededor de los momentos que viniste a buscar a Puerto Rico.', personBehind: 'La persona detrás de la experiencia', captainStamp: 'Días de isla con capitán', glimpseKicker: 'Un vistazo al día', seaLife: 'Vida marina', naturalBeauty: 'Belleza natural', nextDayWater: 'Tu próximo día en el agua', goodToKnow: 'Bueno saber', questionsAnswered: 'Preguntas, respondidas.', feelReady: 'Todo lo que necesitas para estar listo para tu día en el mar.', dayToRemember: 'Haz que sea un día para recordar', contactCaptain: 'Contacta al Capitán Jorge', exploreFooter: 'Explorar', required: 'Requerido', sent: 'Gracias. El Capitán Jorge te contactará pronto.'
  }
};

const includes = [
  { icon: Snowflake, en: ['Refreshments', 'Cooler with ice · Bottled water · Sodas · Local beers — 24 pack'], es: ['Refrescos', 'Hielera con hielo · Agua · Sodas · Cervezas locales — paquete de 24'] },
  { icon: Utensils, en: ['Food', 'Seasonal fresh fruit · Bakery sandwiches · Cheese platter · Dips & chips'], es: ['Comida', 'Frutas frescas de temporada · Sándwiches · Tabla de quesos · Dips y chips'] },
  { icon: Waves, en: ['Water & Beach', 'Floating noodles · Snorkeling gear · Beach game supplies'], es: ['Agua y playa', 'Flotadores · Equipo de snorkeling · Juegos de playa'] },
  { icon: Music2, en: ['Entertainment', 'Bluetooth music connection'], es: ['Entretenimiento', 'Conexión para música Bluetooth'] },
];
const reasons = [
  { icon: CircleUserRound, en: ['Personal Attention', 'Enjoy a more personal experience on the water with Captain Jorge.'], es: ['Atención personal', 'Disfruta una experiencia más personal en el agua con el Capitán Jorge.'] },
  { icon: Compass, en: ['Four Caribbean Destinations', 'Explore the beautiful waters around Icacos, Palomino, Vieques and Culebra.'], es: ['Cuatro destinos caribeños', 'Explora las hermosas aguas alrededor de Icacos, Palomino, Vieques y Culebra.'] },
  { icon: GlassWater, en: ['Everything Included', 'Refreshments, snacks, snorkeling equipment and beach essentials are included.'], es: ['Todo incluido', 'Refrescos, refrigerios, equipo de snorkeling y artículos de playa están incluidos.'] },
  { icon: Sparkles, en: ['Relax & Enjoy', 'We prepare the essentials so you can focus on enjoying your day.'], es: ['Relájate y disfruta', 'Preparamos lo esencial para que te concentres en disfrutar tu día.'] },
];
const steps = [
  { number: '01', icon: Users, en: ['Meet Captain Jorge', 'Arrive and get ready for your island adventure.'], es: ['Conoce al Capitán Jorge', 'Llega y prepárate para tu aventura en la isla.'] },
  { number: '02', icon: ShipWheel, en: ['Cruise the Caribbean', "Enjoy the ride across Puerto Rico's beautiful coastal waters."], es: ['Navega el Caribe', 'Disfruta el recorrido por las hermosas aguas costeras de Puerto Rico.'] },
  { number: '03', icon: Fish, en: ['Explore & Relax', 'Swim, snorkel, enjoy the beach, food and music.'], es: ['Explora y relájate', 'Nada, haz snorkeling y disfruta la playa, la comida y la música.'] },
  { number: '04', icon: Sparkles, en: ['Make Memories', 'Enjoy the Caribbean before cruising back.'], es: ['Crea memorias', 'Disfruta el Caribe antes de regresar navegando.'] },
];
const navIds = ['experience', 'destinations', 'included', 'gallery', 'paradise', 'before', 'faq', 'contact'];

function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<GalleryCategory | 'all'>('all');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = copy[language];
  const text = (item: { en: string[]; es: string[] }) => item[language];
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true); setSubmitError(false);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      email: String(formData.get('email') ?? ''),
      destination: String(formData.get('destination') ?? ''),
      preferred_date: formData.get('date') ? String(formData.get('date')) : null,
      guests: formData.get('guests') ? Number(formData.get('guests')) : null,
      message: formData.get('message') ? String(formData.get('message')) : null,
    };
    if (!supabase) { setSubmitError(true); setSubmitting(false); return; }
    const { error } = await supabase.from('booking_requests').insert(payload);
    if (error) { setSubmitError(true); } else { setSent(true); form.reset(); }
    setSubmitting(false);
  };
  const filteredGallery = galleryFilter === 'all' ? gallery : gallery.filter(photo => photo.category === galleryFilter);

  useEffect(() => {
    if (activeImage === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveImage(null);
      if (e.key === 'ArrowLeft') setActiveImage(prev => prev === null ? null : (prev - 1 + gallery.length) % gallery.length);
      if (e.key === 'ArrowRight') setActiveImage(prev => prev === null ? null : (prev + 1) % gallery.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeImage]);

  let touchStartX = 0;
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) setActiveImage(prev => prev === null ? null : (prev - 1 + gallery.length) % gallery.length);
      else setActiveImage(prev => prev === null ? null : (prev + 1) % gallery.length);
    }
  };

  return <div className="site-shell">
    <header className={`site-header${scrolled ? ' header-scrolled' : ''}`}>
      <a className="brand" href="#top" aria-label={business.name}><img src={business.logo} alt="Tours Shaddai" /></a>
      <nav className={`desktop-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
        {t.nav.map((label, index) => <button key={label} onClick={() => scrollTo(navIds[index])}>{label}</button>)}
      </nav>
      <div className="header-actions"><div className="language-toggle" aria-label="Language selector"><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button><span>/</span><button className={language === 'es' ? 'active' : ''} onClick={() => setLanguage('es')}>ES</button></div><a className="header-whatsapp" href={language === 'es' ? business.whatsappEs : business.whatsapp} target="_blank" rel="noreferrer"><WhatsApp size={15} /> <span>{t.whatsapp}</span></a><button className="header-book" onClick={() => scrollTo('contact')}>{t.book}</button></div>
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button>
    </header>

    <main id="top">
      <section className="hero" style={{ backgroundImage: `url(${images.hero})` }}>
        <div className="hero-overlay" /><div className="hero-content"><p className="eyebrow"><span />{t.eyebrow}</p><h1>{t.title}</h1><p className="hero-copy">{t.hero}</p><p className="hero-sub">{t.heroSub}</p><div className="hero-actions"><button className="button button-gold" onClick={() => scrollTo('contact')}>{t.book} <ArrowDownRight size={18} /></button><a className="button button-whatsapp" href={language === 'es' ? business.whatsappEs : business.whatsapp} target="_blank" rel="noreferrer"><WhatsApp size={17} /> {t.whatsapp}</a></div><div className="social-actions"><a href={business.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a></div></div><div className="hero-scroll"><span>{t.scrollExplore}</span><ArrowDownRight size={16} /></div>
      </section>

      <div className="trust-strip">{[['Icacos', Waves], ['Palomino', Anchor], ['Vieques', MapPin], ['Culebra', Compass], ['Snorkeling', Fish], ['Captain-Led', ShipWheel]].map(([label, Icon]) => <div className="trust-item" key={label as string}><Icon size={17} /><span>{label === 'Captain-Led' ? t.captainLed : label as string}</span></div>)}</div>

      <section className="intro section" id="experience"><div className="section-kicker">{t.feelingKicker}</div><div className="intro-grid"><div><h2>{t.introTitle}</h2><div className="gold-rule" /></div><div><p className="lead-text">{t.intro}</p><button className="text-link" onClick={() => scrollTo('contact')}>{t.plan} <ArrowRight size={17} /></button></div></div></section>

      <section className="destinations section-dark" id="destinations" style={{ backgroundImage:`url(${destinationBanner})` }}><div className="destinations-overlay" /><div className="destinations-inner"><div className="section-heading centered"><div className="section-kicker light">{t.islandsAwait}</div><h2>{t.destinationsTitle}</h2><p>{t.destinationsSub}</p></div><div className="destination-list">{destinations.map((destination, index) => { const item = destination[language]; return <article className="destination-item" key={destination.key}><span className="destination-number">0{index + 1} / {t.destinationLabel}</span><h3>{item.name}</h3><p>{item.description}</p></article>; })}</div></div></section>

      <section className="included section" id="included"><div className="section-heading"><div className="section-kicker">{t.preparedKicker}</div><h2>{t.includesTitle}</h2><p>{t.includesSub}</p></div><div className="include-grid">{includes.map(({ icon: Icon, en, es }) => { const [title, details] = text({ en, es }); return <article className="include-item" key={title}><div className="icon-square"><Icon size={22} /></div><h3>{title}</h3><p>{details}</p></article>; })}</div><div className="included-note"><Beer size={19} /><span>{t.includedNote}</span></div></section>

      <section className="before section" id="before"><div className="before-card"><div className="before-art"><Sun size={150} strokeWidth={0.7} /><span>{t.comePrepared.split('.')[0]}.<br />{t.comePrepared.split('.')[1]}.</span></div><div className="before-content"><div className="section-kicker light">{t.localKnowledge}</div><h2>{t.beforeTitle}</h2><p>{t.beforeSub}</p><div className="bring-list">{(language === 'en' ? ['Small bag', 'Towel', 'Sunscreen — NO spray sunscreen', 'Your preferred alcoholic beverages'] : ['Bolso pequeño', 'Toalla', 'Protector solar — NO aerosol', 'Tus bebidas alcohólicas preferidas']).map(item => <div key={item}><Check size={16} />{item}</div>)}</div><div className="notice"><strong>{t.notice}</strong><span>{t.sunscreen}</span></div></div></div></section>

      <section className="timeline section"><div className="section-heading centered"><div className="section-kicker">{t.shoreToShore}</div><h2>{t.timelineTitle}</h2></div><div className="timeline-grid">{steps.map(({ number, icon: Icon, en, es }) => { const [title, detail] = text({ en, es }); return <article className="step" key={number}><div className="step-top"><span>{number}</span><Icon size={24} /></div><h3>{title}</h3><p>{detail}</p></article>; })}</div></section>

      <section className="why section-dark" style={{ backgroundImage: "url('/images/gallery/SUNS.jpeg')" }}><div className="why-overlay" /><div className="why-layout"><div className="why-intro"><div className="section-kicker light">{t.betterBoatDay}</div><h2>{t.whyTitle}</h2><p>{t.whyText}</p></div><div className="reasons-grid">{reasons.map(({ icon: Icon, en, es }) => { const [title, detail] = text({ en, es }); return <article key={title}><Icon size={22} /><h3>{title}</h3><p>{detail}</p></article>; })}</div></div></section>

      <section className="captain section"><div className="captain-image"><img src={images.captain} alt="Captain Jorge Martinez" loading="lazy" /><div className="captain-stamp"><Anchor size={22} /><span>{t.captainStamp.split(' ').slice(0, 1).join(' ')}<br />{t.captainStamp.split(' ').slice(1).join(' ')}</span></div></div><div className="captain-copy"><div className="section-kicker">{t.personBehind}</div><h2>{t.captainTitle}</h2><p>{t.captainText}</p><a className="text-link" href={language === 'es' ? business.whatsappEs : business.whatsapp} target="_blank" rel="noreferrer"><WhatsApp size={17} /> {t.whatsapp}</a><a className="captain-email" href={business.emailLink}><Mail size={16} /> {business.email}</a></div></section>

      <section className="gallery section" id="gallery"><div className="section-heading"><div className="section-kicker">{t.glimpseKicker}</div><h2>{t.galleryTitle}</h2><p>{t.gallerySub}</p></div><div className="gallery-filters">{galleryCategories.map(cat => <button key={cat.key} className={galleryFilter === cat.key ? 'active' : ''} onClick={() => setGalleryFilter(cat.key)}>{language === 'en' ? cat.en : cat.es}</button>)}</div><div className="gallery-grid">{filteredGallery.map((photo, index) => <button className="gallery-photo" key={photo.image} onClick={() => setActiveImage(gallery.indexOf(photo))}><img src={photo.image} alt={language === 'en' ? photo.caption : photo.captionEs} loading="lazy" /><span>{photo.image === '/images/gallery/TOR.jpeg' || photo.image === '/images/gallery/TOR2.jpeg' ? t.seaLife : language === 'en' ? (galleryCategories.find(c => c.key === photo.category)?.en ?? photo.category) : (galleryCategories.find(c => c.key === photo.category)?.es ?? photo.category)}</span></button>)}</div>{reviews.length === 0 && <div className="reviews-coming"><Sparkles size={19} /><span>{t.reviews}</span></div>}</section>

      <section className="paradise section-dark" id="paradise"><div className="paradise-layout"><div className="paradise-copy"><div className="section-kicker light"><Leaf size={14} /> {t.naturalBeauty}</div><h2>{t.paradiseTitle}</h2><p>{t.paradiseSub}</p><button className="text-link paradise-cta" onClick={() => scrollTo('contact')}>{t.plan} <ArrowRight size={17} /></button></div><div className="paradise-images">{sunsetImages.map((src, i) => <div className="paradise-photo" key={src}><img src={src} alt={language === 'en' ? `Sunset moment ${i + 1}` : `Momento de atardecer ${i + 1}`} loading="lazy" /></div>)}</div></div></section>

      <section className="contact section-dark" id="contact"><div className="contact-layout"><div className="contact-intro"><div className="section-kicker light">{t.nextDayWater}</div><h2>{t.contactTitle}</h2><p>{t.contactText}</p><div className="contact-direct"><a href={language === 'es' ? business.whatsappEs : business.whatsapp} target="_blank" rel="noreferrer"><WhatsApp size={18} /><span><small>{t.whatsapp}</small>{language === 'es' ? 'Chatea con nosotros' : 'Chat with us'}</span></a><a href={business.emailLink}><Mail size={18} /><span><small>{t.sendEmail}</small>{business.email}</span></a></div></div></div></section>

      <section className="faq section" id="faq"><div className="faq-layout"><div className="section-heading"><div className="section-kicker">{t.goodToKnow}</div><h2>{t.questionsAnswered}</h2><p>{t.feelReady}</p></div><div className="faq-list">{faqs.map((faq, index) => { const [question, answer] = faq[language]; return <div className={`faq-item ${activeFaq === index ? 'expanded' : ''}`} key={question}><button onClick={() => setActiveFaq(activeFaq === index ? null : index)}><span>{question}</span><ChevronDown size={18} /></button>{activeFaq === index && <p>{answer}</p>}</div>; })}</div></div></section>
    </main>

    <footer className="footer"><div className="footer-top"><div className="footer-brand"><img src={business.logo} alt="Tours Shaddai" /><p>Cayo Icacos · Palomino · Vieques · Culebra<br />Puerto Rico</p></div><div><span className="footer-label">{t.contactCaptain}</span><a href={language === 'es' ? business.whatsappEs : business.whatsapp} target="_blank" rel="noreferrer">{t.whatsapp}</a><a href={business.emailLink}>{business.email}</a></div><div><span className="footer-label">{t.exploreFooter}</span><button onClick={() => scrollTo('experience')}>{t.nav[0]}</button><button onClick={() => scrollTo('destinations')}>{t.nav[1]}</button><button onClick={() => scrollTo('gallery')}>{t.nav[3]}</button><button onClick={() => scrollTo('contact')}>{t.nav[7]}</button></div><div className="footer-cta"><span className="footer-label">{t.dayToRemember}</span><button onClick={() => scrollTo('contact')}>{t.footerCta} <ArrowUpRight size={17} /></button><div className="footer-social"><a href={business.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Tours Shaddai. {t.allRights}</span><span>Captain Jorge Martinez · Puerto Rico</span></div></footer>
    <div className="mobile-bar"><a href={language === 'es' ? business.whatsappEs : business.whatsapp} target="_blank" rel="noreferrer"><WhatsApp size={16} />{t.whatsapp}</a><button onClick={() => scrollTo('contact')}><CalendarDays size={16} />{t.book}</button><a href={business.instagram} target="_blank" rel="noreferrer"><Instagram size={16} />Instagram</a></div>
    {activeImage !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label={t.close} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}><button className="lightbox-close" onClick={() => setActiveImage(null)} aria-label={t.close}><X /></button><button className="lightbox-arrow left" onClick={() => setActiveImage((activeImage - 1 + gallery.length) % gallery.length)} aria-label={t.previous}><ArrowLeft /></button><img src={gallery[activeImage].image} alt={language === 'en' ? gallery[activeImage].caption : gallery[activeImage].captionEs} /><button className="lightbox-arrow right" onClick={() => setActiveImage((activeImage + 1) % gallery.length)} aria-label={t.next}><ArrowRight /></button><div className="lightbox-caption">{activeImage + 1} / {gallery.length} · {language === 'en' ? gallery[activeImage].caption : gallery[activeImage].captionEs}</div></div>}
  </div>;
}

export default App;
