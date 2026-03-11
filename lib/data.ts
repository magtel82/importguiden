import type { Country, CarBrand, MotorhomeBrand, CostData } from "@/types";
import countriesData from "@/data/countries.json";
import carBrandsData from "@/data/car-brands.json";
import motorhomeBrandsData from "@/data/motorhome-brands.json";
import costDataRaw from "@/data/cost-data.json";

export function getCountries(): Country[] {
  return countriesData.countries as Country[];
}

export function getCountryBySlug(slug: string): Country | undefined {
  return getCountries().find((c) => c.slug === slug);
}

export function getCarBrands(): CarBrand[] {
  return carBrandsData.brands as CarBrand[];
}

export function getCarBrandBySlug(slug: string): CarBrand | undefined {
  return getCarBrands().find((b) => b.slug === slug);
}

export function getMotorhomeBrands(): MotorhomeBrand[] {
  return motorhomeBrandsData.brands as MotorhomeBrand[];
}

export function getCostData(): CostData {
  return costDataRaw as CostData;
}

export function formatSEK(amount: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(amount);
}
