import { getLocales } from "expo-localization";

export interface DeliveryService {
  name: string;
  icon: string;
  openSearch: (query: string) => string; // returns URL
}

// ─── Verified URL patterns per service ─────────────────────────────────────────
// These URLs are verified to work when opened via Linking.openURL() on a real
// device. iOS Universal Links / Android App Links will open the native app if
// installed; otherwise Safari/Chrome loads the SPA which renders properly.
//
// Services with search URLs: Uber Eats, DoorDash (work via SPA in browser)
// Services without search URLs: link to homepage/restaurant listing page
// ────────────────────────────────────────────────────────────────────────────────

const SERVICES: Record<string, DeliveryService[]> = {
  // ─── North America ──────────────────────────────────────────────────────────
  US: [
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
    { name: "DoorDash", icon: "🔴", openSearch: (q) => `https://www.doordash.com/search/store/${enc(q)}/` },
  ],
  CA: [
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
    { name: "SkipTheDishes", icon: "🟠", openSearch: () => `https://www.skipthedishes.com/` },
  ],
  MX: [
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
    { name: "Rappi", icon: "🟠", openSearch: () => `https://www.rappi.com.mx/restaurantes` },
  ],

  // ─── Europe ─────────────────────────────────────────────────────────────────
  GB: [
    { name: "Deliveroo", icon: "🔵", openSearch: () => `https://deliveroo.co.uk/` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  DE: [
    { name: "Lieferando", icon: "🟠", openSearch: () => `https://www.lieferando.de/` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  FR: [
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
    { name: "Deliveroo", icon: "🔵", openSearch: () => `https://deliveroo.fr/` },
  ],
  ES: [
    { name: "Glovo", icon: "🟡", openSearch: () => `https://glovoapp.com/` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  IT: [
    { name: "Glovo", icon: "🟡", openSearch: () => `https://glovoapp.com/` },
    { name: "Deliveroo", icon: "🔵", openSearch: () => `https://deliveroo.it/` },
  ],
  NL: [
    { name: "Thuisbezorgd", icon: "🟠", openSearch: () => `https://www.thuisbezorgd.nl/` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  IE: [
    { name: "Deliveroo", icon: "🔵", openSearch: () => `https://deliveroo.ie/` },
    { name: "Just Eat", icon: "🟠", openSearch: () => `https://www.just-eat.ie/` },
  ],
  PL: [
    { name: "Glovo", icon: "🟡", openSearch: () => `https://glovoapp.com/` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  PT: [
    { name: "Glovo", icon: "🟡", openSearch: () => `https://glovoapp.com/` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  SE: [
    { name: "Foodora", icon: "🩷", openSearch: () => `https://www.foodora.se/` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  NO: [
    { name: "Foodora", icon: "🩷", openSearch: () => `https://www.foodora.no/` },
    { name: "Wolt", icon: "🔵", openSearch: () => `https://wolt.com/en/discovery` },
  ],
  FI: [
    { name: "Wolt", icon: "🔵", openSearch: () => `https://wolt.com/en/discovery` },
    { name: "Foodora", icon: "🩷", openSearch: () => `https://www.foodora.fi/` },
  ],
  DK: [
    { name: "Wolt", icon: "🔵", openSearch: () => `https://wolt.com/en/discovery` },
    { name: "Just Eat", icon: "🟠", openSearch: () => `https://www.just-eat.dk/` },
  ],
  AT: [
    { name: "Lieferando", icon: "🟠", openSearch: () => `https://www.lieferando.at/` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  CH: [
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
    { name: "Just Eat", icon: "🟠", openSearch: () => `https://www.just-eat.ch/` },
  ],
  BE: [
    { name: "Deliveroo", icon: "🔵", openSearch: () => `https://deliveroo.be/` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  GR: [
    { name: "Wolt", icon: "🔵", openSearch: () => `https://wolt.com/en/discovery` },
    { name: "efood", icon: "🟠", openSearch: () => `https://www.e-food.gr/` },
  ],
  CZ: [
    { name: "Wolt", icon: "🔵", openSearch: () => `https://wolt.com/en/discovery` },
    { name: "Bolt Food", icon: "🟢", openSearch: () => `https://food.bolt.eu/` },
  ],
  RO: [
    { name: "Glovo", icon: "🟡", openSearch: () => `https://glovoapp.com/` },
    { name: "Bolt Food", icon: "🟢", openSearch: () => `https://food.bolt.eu/` },
  ],

  // ─── South America ──────────────────────────────────────────────────────────
  BR: [
    { name: "iFood", icon: "🔴", openSearch: () => `https://www.ifood.com.br/restaurantes` },
    { name: "Rappi", icon: "🟠", openSearch: () => `https://www.rappi.com.br/restaurantes` },
  ],
  AR: [
    { name: "Rappi", icon: "🟠", openSearch: () => `https://www.rappi.com.ar/restaurantes` },
    { name: "PedidosYa", icon: "🔴", openSearch: () => `https://www.pedidosya.com.ar/` },
  ],
  CO: [
    { name: "Rappi", icon: "🟠", openSearch: () => `https://www.rappi.com.co/restaurantes` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  CL: [
    { name: "Rappi", icon: "🟠", openSearch: () => `https://www.rappi.cl/restaurantes` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  PE: [
    { name: "Rappi", icon: "🟠", openSearch: () => `https://www.rappi.com.pe/restaurantes` },
    { name: "PedidosYa", icon: "🔴", openSearch: () => `https://www.pedidosya.com.pe/` },
  ],

  // ─── Asia-Pacific ───────────────────────────────────────────────────────────
  IN: [
    { name: "Zomato", icon: "🔴", openSearch: () => `https://www.zomato.com/` },
    { name: "Swiggy", icon: "🟠", openSearch: () => `https://www.swiggy.com/` },
  ],
  JP: [
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
    { name: "Demae-can", icon: "🔴", openSearch: () => `https://demae-can.com/` },
  ],
  KR: [
    { name: "Coupang Eats", icon: "🟤", openSearch: () => `https://www.coupangeats.com/` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  AU: [
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
    { name: "DoorDash", icon: "🔴", openSearch: (q) => `https://www.doordash.com/search/store/${enc(q)}/` },
  ],
  NZ: [
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
    { name: "DoorDash", icon: "🔴", openSearch: (q) => `https://www.doordash.com/search/store/${enc(q)}/` },
  ],
  SG: [
    { name: "Grab", icon: "🟢", openSearch: (q) => `https://food.grab.com/sg/en/restaurants?search=${enc(q)}` },
    { name: "foodpanda", icon: "🩷", openSearch: () => `https://www.foodpanda.sg/` },
  ],
  MY: [
    { name: "Grab", icon: "🟢", openSearch: (q) => `https://food.grab.com/my/en/restaurants?search=${enc(q)}` },
    { name: "foodpanda", icon: "🩷", openSearch: () => `https://www.foodpanda.my/` },
  ],
  TH: [
    { name: "Grab", icon: "🟢", openSearch: (q) => `https://food.grab.com/th/en/restaurants?search=${enc(q)}` },
    { name: "foodpanda", icon: "🩷", openSearch: () => `https://www.foodpanda.co.th/` },
  ],
  PH: [
    { name: "Grab", icon: "🟢", openSearch: (q) => `https://food.grab.com/ph/en/restaurants?search=${enc(q)}` },
    { name: "foodpanda", icon: "🩷", openSearch: () => `https://www.foodpanda.ph/` },
  ],
  ID: [
    { name: "GoFood", icon: "🟢", openSearch: () => `https://gofood.co.id/` },
    { name: "Grab", icon: "🟢", openSearch: (q) => `https://food.grab.com/id/en/restaurants?search=${enc(q)}` },
  ],
  VN: [
    { name: "Grab", icon: "🟢", openSearch: (q) => `https://food.grab.com/vn/en/restaurants?search=${enc(q)}` },
    { name: "ShopeeFood", icon: "🟠", openSearch: () => `https://shopeefood.vn/` },
  ],
  HK: [
    { name: "Deliveroo", icon: "🔵", openSearch: () => `https://deliveroo.hk/` },
    { name: "foodpanda", icon: "🩷", openSearch: () => `https://www.foodpanda.hk/` },
  ],
  TW: [
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
    { name: "foodpanda", icon: "🩷", openSearch: () => `https://www.foodpanda.com.tw/` },
  ],
  PK: [
    { name: "foodpanda", icon: "🩷", openSearch: () => `https://www.foodpanda.pk/` },
    { name: "Careem", icon: "🟢", openSearch: () => `https://www.careem.com/en-PK/food/` },
  ],
  BD: [
    { name: "foodpanda", icon: "🩷", openSearch: () => `https://www.foodpanda.com.bd/` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  LK: [
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
    { name: "PickMe Food", icon: "🟡", openSearch: () => `https://pickme.lk/food` },
  ],

  // ─── Middle East & Africa ───────────────────────────────────────────────────
  AE: [
    { name: "Talabat", icon: "🟠", openSearch: () => `https://www.talabat.com/uae/restaurants` },
    { name: "Careem", icon: "🟢", openSearch: () => `https://www.careem.com/en-AE/food/` },
  ],
  SA: [
    { name: "HungerStation", icon: "🟣", openSearch: () => `https://hungerstation.com/` },
    { name: "Talabat", icon: "🟠", openSearch: () => `https://www.talabat.com/saudi/restaurants` },
  ],
  QA: [
    { name: "Talabat", icon: "🟠", openSearch: () => `https://www.talabat.com/qatar/restaurants` },
    { name: "Careem", icon: "🟢", openSearch: () => `https://www.careem.com/en-QA/food/` },
  ],
  KW: [
    { name: "Talabat", icon: "🟠", openSearch: () => `https://www.talabat.com/kuwait/restaurants` },
    { name: "Careem", icon: "🟢", openSearch: () => `https://www.careem.com/en-KW/food/` },
  ],
  BH: [
    { name: "Talabat", icon: "🟠", openSearch: () => `https://www.talabat.com/bahrain/restaurants` },
    { name: "Careem", icon: "🟢", openSearch: () => `https://www.careem.com/en-BH/food/` },
  ],
  EG: [
    { name: "Talabat", icon: "🟠", openSearch: () => `https://www.talabat.com/egypt/restaurants` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  ZA: [
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
    { name: "Mr D Food", icon: "🔴", openSearch: () => `https://www.mrdfood.com/` },
  ],
  NG: [
    { name: "Bolt Food", icon: "🟢", openSearch: () => `https://food.bolt.eu/` },
    { name: "Glovo", icon: "🟡", openSearch: () => `https://glovoapp.com/` },
  ],
  KE: [
    { name: "Glovo", icon: "🟡", openSearch: () => `https://glovoapp.com/` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  IL: [
    { name: "Wolt", icon: "🔵", openSearch: () => `https://wolt.com/en/discovery` },
    { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  ],
  TR: [
    { name: "Yemeksepeti", icon: "🔴", openSearch: () => `https://www.yemeksepeti.com/` },
    { name: "Getir", icon: "🟣", openSearch: () => `https://getir.com/` },
  ],
};

// Global fallback — Uber Eats (45+ countries) + Google Maps (universal)
const FALLBACK: DeliveryService[] = [
  { name: "Uber Eats", icon: "🟢", openSearch: (q) => `https://www.ubereats.com/search?q=${enc(q)}` },
  { name: "Find Nearby", icon: "📍", openSearch: (q) => `https://www.google.com/maps/search/${enc(q)}+restaurant+near+me/` },
];

function enc(s: string): string {
  return encodeURIComponent(s);
}

/** Get the user's country code from device locale */
function getUserCountry(): string {
  try {
    const locales = getLocales();
    const region = locales[0]?.regionCode;
    if (region) return region.toUpperCase();
  } catch {}
  return "";
}

/** Get the top 2 delivery services for the user's region */
export function getDeliveryServices(): DeliveryService[] {
  const country = getUserCountry();
  return SERVICES[country] ?? FALLBACK;
}
