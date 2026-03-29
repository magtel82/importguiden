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
    importforsäkring_personbil: CostFee;
    importforsäkring_husbil: CostFee;
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

// Brand import data types (pSEO)
export interface PriceRange {
  min: number;
  max: number;
}

export interface RecommendedModel {
  model: string;
  years: string;
  adacRating: string;
  notes: string;
}

export interface RecommendedMotorhomeModel {
  model: string;
  years: string;
  notes: string;
}

export interface KnownIssue {
  issue: string;
  description: string;
  severity: "hög" | "medel" | "låg";
}

export interface TeslaSpecific {
  batteryCheck: string;
  chargingConnector: string;
  superchargerAccess: string;
  warranty: string;
  softwareUpdates: string;
  transferProcess: string;
}

export interface CarBrandImportData {
  slug: string;
  name: string;
  type: "bil";
  intro: string;
  specialCase: boolean;
  specialCaseNote?: string;
  priceAdvantage: string;
  whereToBuy: string[];
  recommendedModels: RecommendedModel[];
  knownIssues: KnownIssue[];
  documentsToRequest: string[];
  teslaSpecific?: TeslaSpecific;
  adacSource: string;
  adacSourceUrl: string;
  priceSEK: PriceRange;
  priceEUR: PriceRange;
}

export interface MotorhomeBrandImportData {
  slug: string;
  name: string;
  type: "husbil";
  intro: string;
  chassis: string;
  chassisWarning: boolean;
  chassisWarningText: string;
  priceAdvantage: string;
  recommendedModels: RecommendedMotorhomeModel[];
  knownIssues: KnownIssue[];
  documentsToRequest: string[];
  adacSource: string;
  adacSourceUrl: string;
  priceSEK: PriceRange;
  priceEUR: PriceRange;
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
