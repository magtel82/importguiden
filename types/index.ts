export interface Country {
  slug: string;
  name: string;
  nameLocal: string;
  code: string;
  currency: string;
  popular: boolean;
  primaryMarket: boolean;
  euMember: boolean;
  notes: string;
  sources: string[];
}

export interface CarBrand {
  slug: string;
  name: string;
  popular: boolean;
  origin: string;
}

export interface MotorhomeBrand {
  slug: string;
  name: string;
  popular: boolean;
  origin: string;
}

export interface PageManifestEntry {
  id: string;                 // primary key: slug deriverat från path
  path: string;               // secondary key: /importera-bil/tyskland
  title: string;
  description: string;
  sources: string[];
  uniquePayloadScore: number; // 0–100
  quality: {
    hasSources: boolean;      // har minst en källhänvisning
    isThin: boolean;          // bedöms som tunt innehåll
    indexable: boolean;       // styr sitemap + robots-tag
  };
  lastEvaluated?: string;     // ISO-datum för senaste quality-gate
  notes?: string;             // manuell fri text – bevaras alltid vid merge
  tags?: string[];            // valfria taggar – bevaras alltid vid merge
  manualOverride?: boolean;   // om true: batch-merge får EJ skriva över indexable
  orphaned?: boolean;         // sätts om sidan försvinner ur batch men finns i manifest
}

export interface PageManifest {
  _version: string;
  _generated: string;
  pages: PageManifestEntry[];
}

export interface CostFee {
  amount: number;
  currency: string;
  note: string;
  source: string;
}

export interface CostData {
  _version: string;
  _updated: string;
  _source: string;
  fees: {
    ursprungskontroll: CostFee;
    registreringsbesiktning_personbil: CostFee;
    registreringsbesiktning_husbil: CostFee;
    skyltavgift: CostFee;
  };
  tax: {
    moms_new_vehicle_threshold_months: number;
    moms_new_vehicle_threshold_km: number;
    moms_rate: number;
    note: string;
    source: string;
  };
  transport: {
    drive_self_cost_per_km: number;
    trailer_transport_from_germany: {
      min: number;
      max: number;
      currency: string;
      note: string;
    };
  };
}

// Calculator types
export interface CalculatorInput {
  price: number;
  currency: string;
  country: string;
  vehicleType: "personbil" | "husbil";
  isNew: boolean;
  ageMonths: number;
  mileageKm: number;
  transportMethod: "self" | "trailer";
}

export interface CalculatorResult {
  vehiclePrice: number;
  vehiclePriceSEK: number;
  moms: number;
  tull: number;
  ursprungskontroll: number;
  registreringsbesiktning: number;
  skyltavgift: number;
  transport: number;
  totalImportCost: number;
  grandTotal: number;
}
