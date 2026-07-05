export type CategoryId = "length" | "weight" | "temperature";

export interface UnitDef {
  id: string;
  label: string;
  symbol: string;
}

export interface CategoryDef {
  id: CategoryId;
  label: string;
  units: UnitDef[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "length",
    label: "Length",
    units: [
      { id: "mm", label: "Millimetres", symbol: "mm" },
      { id: "cm", label: "Centimetres", symbol: "cm" },
      { id: "m", label: "Metres", symbol: "m" },
      { id: "km", label: "Kilometres", symbol: "km" },
      { id: "in", label: "Inches", symbol: "in" },
      { id: "ft", label: "Feet", symbol: "ft" },
      { id: "yd", label: "Yards", symbol: "yd" },
      { id: "mi", label: "Miles", symbol: "mi" },
    ],
  },
  {
    id: "weight",
    label: "Weight",
    units: [
      { id: "mg", label: "Milligrams", symbol: "mg" },
      { id: "g", label: "Grams", symbol: "g" },
      { id: "kg", label: "Kilograms", symbol: "kg" },
      { id: "oz", label: "Ounces", symbol: "oz" },
      { id: "lb", label: "Pounds", symbol: "lb" },
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    units: [
      { id: "c", label: "Celsius", symbol: "\u00b0C" },
      { id: "f", label: "Fahrenheit", symbol: "\u00b0F" },
      { id: "k", label: "Kelvin", symbol: "K" },
    ],
  },
];

// Factors relative to a base unit per category (metres, grams).
const LENGTH_TO_METERS: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

const WEIGHT_TO_GRAMS: Record<string, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  oz: 28.349523125,
  lb: 453.59237,
};

function toCelsius(value: number, unit: string): number {
  if (unit === "c") return value;
  if (unit === "f") return ((value - 32) * 5) / 9;
  if (unit === "k") return value - 273.15;
  throw new Error(`Unknown temperature unit: ${unit}`);
}

function fromCelsius(value: number, unit: string): number {
  if (unit === "c") return value;
  if (unit === "f") return (value * 9) / 5 + 32;
  if (unit === "k") return value + 273.15;
  throw new Error(`Unknown temperature unit: ${unit}`);
}

export function convertValue(
  category: CategoryId,
  fromUnit: string,
  toUnit: string,
  value: number,
): number {
  if (category === "length") {
    const meters = value * LENGTH_TO_METERS[fromUnit];
    return meters / LENGTH_TO_METERS[toUnit];
  }
  if (category === "weight") {
    const grams = value * WEIGHT_TO_GRAMS[fromUnit];
    return grams / WEIGHT_TO_GRAMS[toUnit];
  }
  if (category === "temperature") {
    const celsius = toCelsius(value, fromUnit);
    return fromCelsius(celsius, toUnit);
  }
  throw new Error(`Unknown category: ${category}`);
}

export function getCategory(id: CategoryId): CategoryDef {
  const found = CATEGORIES.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown category: ${id}`);
  return found;
}

export function formatResult(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value * 1e6) / 1e6;
  return rounded.toString();
}
